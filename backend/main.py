from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import create_engine, Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
import os



# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./errand_management.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# FastAPI app
app = FastAPI(title="Errand Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone_number = Column(String, nullable=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class CustomerRequest(Base):
    __tablename__ = "customer_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    details = Column(String)
    tasks = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")


# Create tables
Base.metadata.create_all(bind=engine)


# Pydantic Models (Request/Response schemas)
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TaskSchema(BaseModel):
    task_type: str
    details: str
    description: str


class ServiceRequestCreate(BaseModel):
    details: str
    tasks: List[TaskSchema]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ServiceRequestResponse(BaseModel):
    id: int
    customer_id: int
    details: str
    tasks: List[TaskSchema]
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


# Helper functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = None, db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


# API Routes
@app.post("/api/v1/accounts/login/", response_model=TokenResponse)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    """Login endpoint - authenticate user and return token"""
    user = db.query(User).filter(User.email == user_login.email).first()
    
    if not user or not verify_password(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/v1/accounts/register/", response_model=TokenResponse)
def register(user_register: UserRegister, db: Session = Depends(get_db)):
    """Register endpoint - create new user and return token"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_register.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    db_user = User(
        first_name=user_register.first_name,
        last_name=user_register.last_name,
        email=user_register.email,
        phone_number=user_register.phone_number,
        hashed_password=get_password_hash(user_register.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/v1/customers/{customer_id}/customer-requests/", response_model=ServiceRequestResponse)
def create_service_request(
    customer_id: int,
    request_data: ServiceRequestCreate,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Create a new service request"""
    # Get current user (verify token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user or user.id != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create requests for your own account",
        )
    
    # Create service request
    db_request = CustomerRequest(
        customer_id=customer_id,
        details=request_data.details,
        tasks=[task.dict() for task in request_data.tasks],
        status="pending",
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request


@app.get("/api/v1/customers/{customer_id}/customer-requests/", response_model=List[ServiceRequestResponse])
def get_customer_requests(
    customer_id: int,
    token: str = None,
    db: Session = Depends(get_db),
):
    """Get all service requests for a customer"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user or user.id != customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own requests",
        )
    
    requests = db.query(CustomerRequest).filter(CustomerRequest.customer_id == customer_id).all()
    return requests


@app.get("/api/v1/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Errand Management API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
