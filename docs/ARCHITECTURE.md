# Project Overview & Architecture

## 🎯 Project Objective

The **Health Reward Management System** is a gamified fitness tracking application that motivates users to stay active by:
1. **Tracking Steps** - Users log their daily walking steps
2. **Earning Points** - Points calculated automatically (100 steps = 1 point)
3. **Redeeming Rewards** - Exchange accumulated points for cash, vouchers, tickets, or coupons
4. **Competing** - View rankings on leaderboard to motivate others

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│          Health Reward Management System                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │   React Frontend    │    │    Node.js Backend       │   │
│  │  (Port 3000)        │    │  (Port 5000)             │   │
│  │                     │    │                          │   │
│  │ - Dashboard         │───→│ - Authentication API     │   │
│  │ - Steps Management  │    │ - Steps Management       │   │
│  │ - Rewards           │    │ - Rewards System         │   │
│  │ - Leaderboard       │    │ - User Management        │   │
│  │ - Admin Panel       │    │ - Admin APIs             │   │
│  └─────────────────────┘    └──────────────────────────┘   │
│          │                              │                    │
│          └──────────────┬───────────────┘                    │
│                         │                                     │
│                    ┌────▼─────────┐                          │
│                    │   MongoDB    │                          │
│                    │   Database   │                          │
│                    │              │                          │
│                    └──────────────┘                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Layers

### 1. Frontend Layer (React)
**Responsibilities:**
- User interface and user experience
- Form validation and data collection
- API communication via Axios
- State management with React Context
- Route management with React Router

**Key Components:**
- Authentication pages (Login/Register)
- User dashboard
- Step management interface
- Reward browsing and redemption
- Leaderboard display
- Admin management panels

### 2. Backend API Layer (Express.js)
**Responsibilities:**
- Handle HTTP requests
- Business logic implementation
- Authentication and authorization
- Database operations
- API validation and error handling

**Key Routes:**
- `/api/auth/` - Authentication endpoints
- `/api/steps/` - Step management
- `/api/rewards/` - Reward operations
- `/api/leaderboard/` - Leaderboard data
- `/api/admin/` - Administrative functions

### 3. Database Layer (MongoDB)
**Responsibilities:**
- Data persistence
- Relationships between collections
- Data validation at schema level

**Collections:**
- Users
- Steps
- Rewards
- Redemptions

## 🔄 Data Flow Example: User Logs Steps

```
User Interface (React)
         │
         ▼
    Form Input
         │
    ┌────▼──────────────┐
    │ Axios API Call    │
    │ POST /steps/add   │
    └────┬──────────────┘
         │
    ┌────▼────────────────────┐
    │ Backend Express Server   │
    │                          │
    │ 1. Auth Middleware       │ (Verify JWT Token)
    │ 2. Validation           │ (Check date, steps)
    │ 3. Calculate Points     │ (steps / 100)
    │ 4. Update User Stats    │
    │ 5. Save to Database     │
    └────┬────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │ MongoDB                       │
    │                               │
    │ 1. Create Step Document      │
    │ 2. Update User Totals        │
    │ 3. Calculate Running Points  │
    └────┬─────────────────────────┘
         │
    ┌────▼──────────────┐
    │ Send Response      │ {success, data, message}
    │ to Frontend        │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ React Component    │
    │ Updates UI         │ (Show new points, success message)
    └───────────────────┘
```

## 🔐 Authentication Flow

```
User enters credentials
         │
         ▼
    Validation
         │
         ├─ Valid ─→ Hash password with bcrypt
         │           │
         │           ▼
         │        Compare with stored hash
         │           │
         │           ├─ Match ─→ Generate JWT Token
         │           │           │
         │           │           ▼
         │           │        Send Token + User Data
         │           │           │
         │           │           ▼
         │           │        Browser localStorage
         │           │        saves token
         │           │
         │           └─ No Match ─→ Auth Error
         │
         └─ Invalid ─→ Validation Error
```

## 💾 Data Models

### User Document
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String, // 'user' or 'admin'
  totalSteps: Number,
  totalPoints: Number,
  availablePoints: Number,
  redeemedPoints: Number,
  isBlocked: Boolean
}
```

### Step Document
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  date: Date,
  steps: Number,
  pointsEarned: Number // calculated: steps / 100
}
```

### Reward Document
```javascript
{
  _id: ObjectId,
  title: String,
  category: String, // 'CASH', 'MOVIE_TICKET', etc.
  pointsRequired: Number,
  value: Number,
  description: String
}
```

### Redemption Document
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  rewardId: ObjectId,
  pointsUsed: Number,
  status: String, // 'approved', 'pending', etc.
  redeemCode: String // unique code for redemption
}
```

## 🎯 Key Features & Implementation

### 1. Reward Calculation
```
Formula: Points = Steps ÷ 100

Examples:
- 500 steps → 5 points
- 1000 steps → 10 points
- 5000 steps → 50 points
```

### 2. Redemption System
```
When user redeems reward:
1. Check available points
2. Verify points >= required points
3. Deduct from available points
4. Add to redeemed points
5. Generate unique redemption code
6. Create redemption record
```

### 3. Leaderboard
```
Top 10 users ranked by:
1. Total Points (Primary)
2. Total Steps (Secondary)
```

### 4. Admin Dashboard
```
Shows:
- Total Users
- Total Steps (aggregate)
- Total Points Generated
- Total Redemptions Completed
```

## 🔒 Security Implementation

### Password Security
- Passwords hashed with bcryptjs before storing
- Never stored in plain text
- Verified during login with bcrypt.compare()

### API Authentication
- JWT tokens issued on successful login
- Tokens sent in Authorization header: `Bearer {token}`
- Token verified on protected routes
- Token expiration set to 7 days

### Authorization
- User can only access their own data
- Admin-only routes protected with `authorize('admin')`
- Middleware verifies user role before allowing access

### Data Validation
- Input validated before database operations
- Email format validation
- Step count must be non-negative
- Points calculations validated

## 🚀 Deployment Considerations

### Backend Deployment
- Environment variables for sensitive data
- CORS configured for frontend domain
- MongoDB Atlas recommended for production
- Heroku, Railway, or AWS EC2 hosting options

### Frontend Deployment
- Build optimization with webpack
- Environment variables for API URL
- Vercel, Netlify, or AWS S3+CloudFront hosting
- CDN for static assets

### Database
- MongoDB Atlas (cloud) recommended
- Regular backups configured
- Indexes on frequently queried fields
- Connection pooling configured

## 📈 Scalability

### Current Capacity
- Handles thousands of concurrent users
- Can store millions of step records
- Real-time reward calculations

### Optimization Opportunities
- Add caching layer (Redis)
- Implement pagination for large datasets
- Add database indexing
- API rate limiting
- Server-side rendering with Next.js

## 🛠️ Technology Rationale

### Why MongoDB?
- Flexible schema for various reward types
- Easy horizontal scaling
- JSON-like documents match JavaScript objects
- Built-in support for aggregation queries

### Why Express.js?
- Lightweight and flexible
- Rich middleware ecosystem
- Easy to implement REST APIs
- Good performance

### Why React?
- Component-based architecture
- Virtual DOM for performance
- Strong community and ecosystem
- Easy state management

### Why JWT?
- Stateless authentication
- Scalable across multiple servers
- Secure token-based approach
- Easy implementation

---

## 📚 Complete Flow: Step to Reward

```
1. USER REGISTRATION
   └→ User signs up with email/password
   └→ Password hashed, user created
   └→ JWT token generated

2. DASHBOARD VIEW
   └→ User logs in
   └→ Fetch user stats (steps, points)
   └→ Display in dashboard

3. LOG STEPS
   └→ User enters steps for a date
   └→ Backend calculates points (steps/100)
   └→ Step record created
   └→ User stats updated

4. VIEW REWARDS
   └→ Fetch available rewards
   └→ Display with point requirements
   └→ Check user's available points

5. REDEEM REWARD
   └→ User selects reward
   └→ Check points balance
   └→ Deduct points
   └→ Generate unique code
   └→ Create redemption record

6. REDEMPTION HISTORY
   └→ Show all redeemed rewards
   └→ Display redemption codes
   └→ Track redemption status

7. LEADERBOARD
   └→ Fetch top 10 users
   └→ Display with ranks
   └→ Show user's current rank
```

---

This architecture provides a scalable, secure, and user-friendly platform for fitness gamification!
