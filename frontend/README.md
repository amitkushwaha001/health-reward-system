# Health Reward Management System Frontend

Production-ready React frontend for the Health Reward Management System.

## Installation

```bash
cd frontend
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Running the Application

Development mode:
```bash
npm start
```

Build for production:
```bash
npm run build
```

## Project Structure

- `src/pages/` - Page components for each route
- `src/components/` - Reusable components
- `src/services/` - API service calls
- `src/context/` - React Context for state management
- `src/styles/` - Global CSS styles

## Features

- User Registration and Login
- Dashboard with statistics
- Step management (add, edit, delete)
- Reward redemption system
- Leaderboard
- User profile management
- Admin dashboard
- User management
- Reward management
- Reports

## Available Routes

### User Routes
- `/register` - User registration
- `/login` - User login
- `/dashboard` - User dashboard
- `/steps` - Step management
- `/rewards` - Reward redemption
- `/redemption-history` - View redeemed rewards
- `/leaderboard` - Top users leaderboard
- `/profile` - User profile

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/rewards` - Reward management
- `/admin/reports` - Reports and analytics
