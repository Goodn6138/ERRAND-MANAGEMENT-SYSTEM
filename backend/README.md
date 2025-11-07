# Errand Management Backend

A Python FastAPI backend for the Errand Management System.

## Setup

### 1. Create Virtual Environment
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

### 2. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 3. Run the Server
\`\`\`bash
python main.py
\`\`\`

The server will start at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## Environment Variables

Create a `.env` file in the backend directory:

\`\`\`
DATABASE_URL=sqlite:///./errand_management.db
SECRET_KEY=your-super-secret-key-change-in-production
\`\`\`

## Database

The database is automatically created on first run using SQLite. For production, use PostgreSQL by setting:

\`\`\`
DATABASE_URL=postgresql://user:password@localhost/errand_management
\`\`\`

## API Endpoints

### Authentication
- `POST /api/v1/accounts/login/` - Login user
- `POST /api/v1/accounts/register/` - Register new user

### Service Requests
- `POST /api/v1/customers/{customer_id}/customer-requests/` - Create request
- `GET /api/v1/customers/{customer_id}/customer-requests/` - Get all requests

## Token Usage

All authenticated endpoints require a `Authorization: Bearer <token>` header.

Example:
\`\`\`bash
curl -H "Authorization: Bearer your_token_here" http://localhost:8000/api/v1/customers/1/customer-requests/
