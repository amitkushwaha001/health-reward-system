# Health Reward Management System - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Sample Data](#sample-data)
10. [Troubleshooting](#troubleshooting)

---

## 📊 Project Overview

**Health Reward Management System** is a full-stack MERN application that enables users to:
- Track their daily walking steps
- Earn reward points based on steps (100 steps = 1 point)
- Redeem points for various rewards (cash, movie tickets, vouchers, coupons)
- View their progress on a leaderboard
- Admins can manage users, rewards, and view reports

### Key Features
✅ User Authentication with JWT  
✅ Step Tracking & Management  
✅ Dynamic Reward Calculation  
✅ Reward Redemption System  
✅ Leaderboard  
✅ Admin Dashboard  
✅ User Management  
✅ Reward Management  
✅ Analytics & Reports  

---

## 🏗️ System Architecture

```
Health Reward Management System
│
├── Backend (Node.js + Express)
│   ├── Routes (API endpoints)
│   ├── Controllers (Business logic)
│   ├── Models (MongoDB schemas)
│   ├── Middleware (Auth, Error handling)
│   └── Utils (Helpers, JWT)
│
├── Frontend (React.js)
│   ├── Pages (Components for each route)
│   ├── Components (Reusable UI components)
│   ├── Services (API calls)
│   ├── Context (State management)
│   └── Styles (CSS)
│
└── Database (MongoDB)
    ├── Users Collection
    ├── Steps Collection
    ├── Rewards Collection
    └── Redemptions Collection
```

---

## ✅ Prerequisites

### Required Software
- **Node.js** v14.0.0 or higher
- **npm** or **yarn**
- **MongoDB** (Local or Cloud - MongoDB Atlas recommended)
- **Git** (optional, for version control)

### Browser Support
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

---

## 🚀 Installation

### Step 1: Clone/Download the Project

```bash
# Create a project directory
mkdir health-reward-system
cd health-reward-system
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- validator
- express-async-errors

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This will install:
- react
- react-router-dom
- axios
- chart.js
- react-chartjs-2

---

## ⚙️ Configuration

### Backend Configuration

1. **Create `.env` file in backend directory:**

```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` with your settings:**

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/health-reward-system?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d

# Reward Configuration
STEPS_TO_POINTS_RATIO=100

# Email Configuration (Optional for future use)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### MongoDB Setup

**Option 1: Using MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add connection string to `.env`

**Option 2: Local MongoDB**

```bash
# Install MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Mac: brew install mongodb-community
# Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

# Start MongoDB service
mongod
```

### Frontend Configuration

1. **Create `.env` file in frontend directory:**

```bash
cd frontend
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
```

---

## 🏃 Running the Application

### Method 1: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected: cluster0.mongodb.net
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

### Method 2: Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response: 201 Created
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "totalSteps": 0,
    "totalPoints": 0,
    "availablePoints": 0
  }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": { user_object }
}
```

### Steps Routes

#### Add Steps
```
POST /steps/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2024-05-26",
  "steps": 8500
}

Response: 201 Created
{
  "success": true,
  "data": { step_object },
  "message": "8500 steps recorded! You earned 85 points."
}
```

#### Get Step History
```
GET /steps/history
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [{ step_objects }]
}
```

#### Update Steps
```
PUT /steps/update/:id
Authorization: Bearer {token}

{
  "steps": 9000
}
```

#### Delete Steps
```
DELETE /steps/delete/:id
Authorization: Bearer {token}
```

### Rewards Routes

#### Get All Rewards
```
GET /rewards
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "reward_id",
      "title": "₹10 Cash Reward",
      "category": "CASH",
      "pointsRequired": 100,
      "value": 10,
      "currency": "₹",
      "description": "Get ₹10 cashback"
    }
  ]
}
```

#### Redeem Reward
```
POST /rewards/redeem
Authorization: Bearer {token}

{
  "rewardId": "reward_id"
}

Response: 201 Created
{
  "success": true,
  "data": { redemption_object },
  "message": "Successfully redeemed! Redeem code: RDM1A2B3C"
}
```

### Leaderboard Routes

#### Get Leaderboard
```
GET /leaderboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "rank": 1,
      "name": "Top User",
      "totalSteps": 100000,
      "totalPoints": 1000
    }
  ]
}
```

### Admin Routes

#### Admin Dashboard
```
GET /admin/dashboard
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": {
    "totalUsers": 50,
    "totalSteps": 1000000,
    "totalRewardsGenerated": 10000,
    "totalRedemptions": 500
  }
}
```

#### Get All Users
```
GET /admin/users?search=john&page=1&limit=10
Authorization: Bearer {admin_token}
```

#### Block/Unblock User
```
PATCH /admin/block/:userId
Authorization: Bearer {admin_token}
```

#### Create Reward (Admin)
```
POST /admin/rewards
Authorization: Bearer {admin_token}

{
  "title": "₹50 Cash",
  "category": "CASH",
  "pointsRequired": 500,
  "value": 50,
  "description": "Get ₹50 cashback"
}
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (user | admin),
  totalSteps: Number (default: 0),
  totalPoints: Number (default: 0),
  availablePoints: Number (default: 0),
  redeemedPoints: Number (default: 0),
  isBlocked: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Steps Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date,
  steps: Number (required, min: 0),
  pointsEarned: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Rewards Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  category: String (CASH | MOVIE_TICKET | SHOPPING_VOUCHER | FOOD_COUPON),
  pointsRequired: Number,
  value: Number,
  currency: String (default: ₹),
  description: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Redemptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  rewardId: ObjectId (ref: Reward),
  pointsUsed: Number,
  redemptionType: String,
  value: Number,
  status: String (pending | approved | rejected | completed),
  redeemCode: String (unique),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌱 Sample Data / Seeding

### Seed Database

```bash
cd backend
node seed.js
```

This will create:
- 1 Admin user
- 9 Sample regular users
- Sample step records
- Sample reward entries

### Demo Credentials

**Regular User:**
- Email: `john@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@healthreward.com`
- Password: `AdminPassword123`

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseError: Cannot connect to MongoDB`

**Solutions:**
1. Check if MongoDB is running
2. Verify connection string in `.env`
3. Check username/password for MongoDB Atlas
4. Ensure network access is allowed in MongoDB Atlas

### JWT Token Errors

**Error:** `Not authorized to access this route`

**Solutions:**
1. Check if token is being sent in Authorization header
2. Verify JWT_SECRET matches in backend
3. Check if token has expired
4. Re-login to get a new token

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Verify backend has CORS enabled
2. Check frontend API URL in `.env`
3. Ensure both frontend and backend are running
4. Clear browser cache and cookies

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Node Modules Issues

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Environment Variables Summary

### Backend (.env)
```
MONGODB_URI          - MongoDB connection string
PORT                 - Server port (default: 5000)
NODE_ENV            - Environment (development/production)
JWT_SECRET          - Secret key for JWT signing
JWT_EXPIRE          - Token expiration time
STEPS_TO_POINTS_RATIO - Conversion ratio (default: 100)
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL - Backend API URL
```

---

## 🎯 Next Steps

1. **Customize Reward Categories** - Edit constants in `backend/config/constants.js`
2. **Add Email Notifications** - Configure email service in backend
3. **Implement Analytics Charts** - Use Chart.js for advanced visualizations
4. **Add Payment Gateway** - Integrate Stripe/Razorpay for cash redemption
5. **Deploy** - Use Heroku/Vercel/AWS for production deployment

---

## 📞 Support

For issues and questions, refer to the documentation in each module directory or check the API responses for detailed error messages.

---

## 📄 License

MIT License - Feel free to use this project for personal and commercial purposes.
