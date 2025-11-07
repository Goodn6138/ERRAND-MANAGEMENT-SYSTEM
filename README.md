# Errand Management System

A full-stack application for managing service requests and errands. The system allows users to authenticate, submit service requests with multiple tasks, and manage their submissions.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Troubleshooting](#troubleshooting)

## Project Overview

The Errand Management System is a frontend and backend application that enables users to:

1. **Authenticate** - Create accounts and log in securely
2. **Submit Service Requests** - Create and submit one or multiple errand requests
3. **Manage Tasks** - Add multiple tasks within each service request
4. **Track Submissions** - View submitted requests and their details

The application follows a complete user flow from session validation → authentication → service request submission → confirmation.

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Hook Form** - Efficient form state management
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation using Python type hints
- **Python 3.9+** - Programming language

## Getting Started

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.9+** (for backend)
- **npm** or **yarn** (for frontend package management)
- **pip** (for backend package management)

### Frontend Setup

1. **Navigate to the project root** (if not already there):
   \`\`\`bash
   cd errand-management-system
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment variables**:
   The frontend uses the following environment configuration. Create a `.env.local` file if needed (optional for development):
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   \`\`\`

4. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
   
   The frontend will be available at `http://localhost:3000`

### Backend Setup

1. **Navigate to the backend directory**:
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create a Python virtual environment**:
   \`\`\`bash
   python -m venv venv
   \`\`\`

3. **Activate the virtual environment**:
   - **On macOS/Linux**:
     \`\`\`bash
     source venv/bin/activate
     \`\`\`
   - **On Windows**:
     \`\`\`bash
     venv\Scripts\activate
     \`\`\`

4. **Install dependencies**:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

5. **Run the backend server**:
   \`\`\`bash
   python main.py
   \`\`\`
   
   The backend will be available at `http://localhost:8000`
   - Swagger API documentation: `http://localhost:8000/docs`
   - ReDoc documentation: `http://localhost:8000/redoc`

## Running Locally

To run the complete system locally:

1. **Terminal 1 - Backend**:
   \`\`\`bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python main.py
   \`\`\`
   Backend runs on: `http://localhost:8000`

2. **Terminal 2 - Frontend**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Frontend runs on: `http://localhost:3000`

3. **Access the application**:
   Open your browser to `http://localhost:3000`

## Project Structure

\`\`\`
errand-management-system/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main application page
│   └── globals.css             # Global styles
├── components/
│   ├── auth-form.tsx           # Login/signup form component
│   ├── request-form.tsx        # Service request form component
│   ├── dashboard.tsx           # User dashboard component
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts                  # API client wrapper
│   ├── auth-context.tsx        # React Context for authentication
│   └── utils.ts                # Utility functions
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── database.db             # SQLite database (auto-created)
│   └── README.md               # Backend documentation
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

## API Documentation

### Authentication Endpoints

#### Login
- **Endpoint**: `POST /api/v1/accounts/login/`
- **Request Body**:
  \`\`\`json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "access_token": "token_string",
    "token_type": "bearer",
    "user_id": 1,
    "email": "user@example.com"
  }
  \`\`\`

#### Register
- **Endpoint**: `POST /api/v1/accounts/register/`
- **Request Body**:
  \`\`\`json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "+254712345678",
    "password": "password123"
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "access_token": "token_string",
    "token_type": "bearer",
    "user_id": 1,
    "email": "john@example.com"
  }
  \`\`\`

### Service Request Endpoints

#### Submit Service Request
- **Endpoint**: `POST /api/v1/customers/{customer_id}/customer-requests/`
- **Authorization**: `Bearer {token}`
- **Request Body**:
  \`\`\`json
  {
    "details": "I need help with household tasks",
    "tasks": [
      {
        "task_type": "Cleaning",
        "details": "Clean the kitchen",
        "description": "Deep clean kitchen counters, sink, and appliances"
      },
      {
        "task_type": "Delivery",
        "details": "Pick up groceries",
        "description": "Collect items from Carrefour and deliver to home"
      }
    ]
  }
  \`\`\`
- **Response**:
  \`\`\`json
  {
    "request_id": "req-123",
    "customer_id": 1,
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "tasks_count": 2
  }
  \`\`\`

## Design Decisions

### Frontend Architecture

1. **React Context for Auth** - Instead of Redux or other state management, I used React Context to keep the application lightweight. The auth state includes user info, token, and login/logout methods.

2. **Form Management with React Hook Form** - Chose for performance and minimal re-renders. Combined with Zod for type-safe validation.

3. **Token Storage in localStorage** - Tokens are stored in browser localStorage with a check on app load to restore sessions automatically. For production, consider using httpOnly cookies.

4. **Component Structure** - Separated concerns into:
   - `auth-form.tsx` - Handles both login and signup flows
   - `request-form.tsx` - Dynamic form for adding multiple service requests
   - `dashboard.tsx` - User dashboard with submitted requests

5. **API Client Wrapper** - Created `lib/api.ts` to centralize API calls, handle token injection, and manage error responses consistently.

### Backend Architecture

1. **FastAPI** - Chosen for speed, automatic API documentation, and built-in validation with Pydantic.

2. **SQLAlchemy ORM** - Provides database abstraction and protection against SQL injection.

3. **SQLite Database** - Lightweight and perfect for development. Can be swapped for PostgreSQL in production.

4. **JWT-like Token Generation** - Uses UUID tokens for simplicity. In production, implement proper JWT with expiration.

5. **Modular Structure** - Separates concerns:
   - User authentication endpoints
   - Customer request submission
   - Database models and schemas

## Assumptions

1. **Token Expiration** - Currently, tokens don't expire. In production, implement expiration and refresh token logic.

2. **Phone Number Format** - Expected format is international (+2547...). Validation is basic; enhance for production.

3. **Database Persistence** - SQLite stores data in `database.db`. For production, use PostgreSQL or similar.

4. **Customer ID** - Submission endpoint uses a customer_id path parameter. The frontend currently passes `1`; update to use actual user ID from authentication.

5. **CORS** - Backend has CORS enabled for localhost. Update for production domains.

6. **No Email Verification** - Registration doesn't require email confirmation. Add for production.

7. **Error Handling** - Basic error responses. Enhance with specific error codes and messages for production.

## Troubleshooting

### Common Issues

**Issue**: `Cannot POST /api/v1/accounts/login/`
- **Solution**: Ensure the backend is running on port 8000. Check that `python main.py` is executing without errors.

**Issue**: `CORS error` when frontend calls backend
- **Solution**: Ensure backend has CORS configured for `http://localhost:3000`. Check `backend/main.py` CORS settings.

**Issue**: `Token undefined` after login
- **Solution**: Check browser DevTools → Application → Storage → localStorage. Verify the token is being saved. Check API response includes `access_token`.

**Issue**: `Module not found` (Python)
- **Solution**: Ensure you're in the virtual environment and ran `pip install -r requirements.txt`.

**Issue**: Port already in use
- **Solution**: 
  - For port 3000: `lsof -i :3000` and kill the process, or run on different port
  - For port 8000: `lsof -i :8000` and kill the process

### Debugging

**Frontend**: Open browser DevTools (F12) → Console to see client-side errors
**Backend**: Check terminal output where `python main.py` is running for server logs

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_BASE_URL` to your backend URL
4. Deploy

### Backend (Heroku/Railway/Render)
1. Create account on hosting platform
2. Connect GitHub repository
3. Set up Python environment
4. Deploy

## License

This project is part of a recruitment task evaluation.

## Support

For issues or questions, please refer to the individual README files:
- Frontend issues: See `app/` directory
- Backend issues: See `backend/README.md`
