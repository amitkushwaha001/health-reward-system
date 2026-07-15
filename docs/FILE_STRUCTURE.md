# Complete Project File Structure

```
health-reward-system/
│
├── backend/                          # Node.js Backend
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── constants.js             # App-wide constants
│   │
│   ├── models/                      # MongoDB Schemas
│   │   ├── User.js                  # User schema with bcrypt
│   │   ├── Step.js                  # Step records
│   │   ├── Reward.js                # Reward offers
│   │   └── Redemption.js            # Redemption records
│   │
│   ├── controllers/                 # Business Logic
│   │   ├── authController.js        # Register, Login, Profile
│   │   ├── userController.js        # Profile update, Password change
│   │   ├── stepController.js        # Step CRUD operations
│   │   ├── rewardController.js      # Reward retrieval, Redemption
│   │   ├── leaderboardController.js # Ranking queries
│   │   └── adminController.js       # Admin operations
│   │
│   ├── routes/                      # API Endpoints
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── userRoutes.js           # /api/user/*
│   │   ├── stepRoutes.js           # /api/steps/*
│   │   ├── rewardRoutes.js         # /api/rewards/*
│   │   ├── leaderboardRoutes.js    # /api/leaderboard/*
│   │   └── adminRoutes.js          # /api/admin/*
│   │
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification, role authorization
│   │   └── errorHandler.js         # Global error handling
│   │
│   ├── utils/
│   │   └── helpers.js              # JWT generation, point calculation
│   │
│   ├── server.js                   # Main server file
│   ├── seed.js                     # Database seeding script
│   ├── package.json                # Dependencies
│   ├── .env.example                # Environment template
│   ├── .gitignore
│   └── README.md                   # Backend documentation
│
├── frontend/                        # React Frontend
│   ├── public/
│   │   ├── index.html              # Entry HTML
│   │   └── manifest.json           # PWA manifest
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPages.jsx       # Login & Register components
│   │   │   ├── Dashboard.jsx       # User dashboard
│   │   │   ├── Steps.jsx           # Step management page
│   │   │   ├── Rewards.jsx         # Reward redemption & history
│   │   │   ├── Leaderboard.jsx     # Leaderboard page
│   │   │   ├── Profile.jsx         # User profile & settings
│   │   │   └── AdminPages.jsx      # All admin pages
│   │   │
│   │   ├── components/
│   │   │   └── Shared.jsx          # Reusable components (Header, Footer, Cards)
│   │   │
│   │   ├── services/
│   │   │   ├── api.js              # Axios configuration
│   │   │   └── apiService.js       # All API endpoints
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   │
│   │   ├── styles/
│   │   │   └── index.css           # Global styles
│   │   │
│   │   ├── App.js                  # Main router & layout
│   │   └── index.js                # React entry point
│   │
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── docs/
│   ├── SETUP_GUIDE.md              # Detailed installation & API docs
│   ├── ARCHITECTURE.md             # System architecture overview
│   └── FILE_STRUCTURE.md           # This file
│
├── README.md                        # Project overview
├── QUICK_START.md                  # 5-minute setup guide
└── .gitignore                      # Git ignore rules

```

## 📁 Detailed Module Breakdown

### Backend Structure

#### `/config`
- **database.js**: Mongoose connection setup
- **constants.js**: Reward categories, user roles, redemption status

#### `/models` (MongoDB Schemas)
- **User.js**: User authentication, stats
  - Fields: name, email, password (hashed), role, totalSteps, totalPoints
  - Methods: matchPassword()

- **Step.js**: Daily step records
  - Fields: userId, date, steps, pointsEarned
  - Unique index: userId + date

- **Reward.js**: Reward offer catalog
  - Fields: title, category, pointsRequired, value
  - Categories: CASH, MOVIE_TICKET, SHOPPING_VOUCHER, FOOD_COUPON

- **Redemption.js**: User redemption records
  - Fields: userId, rewardId, pointsUsed, status, redeemCode

#### `/controllers` (Business Logic)
- **authController.js**: 
  - `register()` - Create new user
  - `login()` - Authenticate user
  - `getProfile()` - Fetch user profile

- **userController.js**:
  - `updateProfile()` - Update user info
  - `changePassword()` - Change password

- **stepController.js**:
  - `addSteps()` - Log steps (calculates points)
  - `getStepHistory()` - Fetch step records
  - `updateSteps()` - Modify existing steps
  - `deleteSteps()` - Remove step record

- **rewardController.js**:
  - `getRewards()` - Fetch available rewards
  - `redeemReward()` - Process redemption
  - `getRedemptionHistory()` - Fetch user redemptions

- **leaderboardController.js**:
  - `getLeaderboard()` - Top 10 users
  - `getUserRank()` - User's current rank

- **adminController.js**:
  - `getDashboardStats()` - System statistics
  - `getUsers()` - Fetch all users with search
  - `deleteUser()` - Remove user
  - `blockUser()` - Block/unblock user
  - `createReward()` - Add new reward
  - `updateReward()` - Modify reward
  - `deleteReward()` - Remove reward
  - `getReports()` - Generate reports

#### `/routes` (API Endpoints)
Each file contains Express Router with specific endpoints for its domain.

#### `/middleware`
- **auth.js**: `protect()` (verify JWT), `authorize()` (role check)
- **errorHandler.js**: Centralized error handling

#### `/utils`
- **helpers.js**: `generateToken()`, `calculatePoints()`, `sendTokenResponse()`

### Frontend Structure

#### `/pages`
**AuthPages.jsx**
- `<Register />` - Registration form
- `<Login />` - Login form with demo credentials

**Dashboard.jsx**
- `<Dashboard />` - Main user dashboard
  - Stats cards
  - Quick action buttons
  - Recent activity

**Steps.jsx**
- `<StepsPage />` - Step management
  - Add/Edit/Delete steps
  - Step history table
  - Points calculation display

**Rewards.jsx**
- `<RewardsPage />` - Reward browsing
  - Reward cards with icons
  - Check point balance
  - Redeem buttons
- `<RedemptionHistory />` - View redeemed rewards
  - Redemption history table
  - Status badges
  - Redemption codes

**Leaderboard.jsx**
- `<Leaderboard />` - User rankings
  - Top 10 users
  - User's rank card
  - Points and steps display

**Profile.jsx**
- `<Profile />` - User profile management
  - Edit profile information
  - Change password form
  - Display user stats

**AdminPages.jsx**
- `<AdminDashboard />` - Admin overview
- `<AdminUsers />` - User management
- `<AdminRewards />` - Reward management
- `<AdminReports />` - Reports & analytics

#### `/components`
**Shared.jsx**
- `<Header />` - Navigation bar
- `<Footer />` - Footer
- `<StatCard />` - Statistics display
- `<LoadingSpinner />` - Loading indicator

#### `/services`
- **api.js**: Axios instance with interceptors
- **apiService.js**: All API calls organized by domain

#### `/context`
- **AuthContext.js**: 
  - `<AuthProvider />` - State wrapper
  - `useAuth()` - Hook for auth state
  - Functions: login(), logout(), updateUser()

#### `/styles`
- **index.css**: Global styles, buttons, forms, cards, responsive design

---

## 🔄 Data Flow Paths

### Authentication Flow
```
Register/Login Page
      ↓
authService.register/login()
      ↓
API: POST /auth/register or /auth/login
      ↓
authController: register() or login()
      ↓
User Model: create() or findOne()
      ↓
bcrypt: hash or compare password
      ↓
Generate JWT token
      ↓
Return token + user data
      ↓
AuthContext: login()
      ↓
localStorage: save token
      ↓
Redirect to Dashboard
```

### Step Logging Flow
```
Steps Page
      ↓
stepService.addSteps()
      ↓
API: POST /steps/add
      ↓
protect middleware: verify JWT
      ↓
stepController: addSteps()
      ↓
Calculate points: steps / 100
      ↓
Step Model: create()
      ↓
User Model: updateOne() (update totals)
      ↓
Return success response
      ↓
Update UI with new points
```

### Reward Redemption Flow
```
Rewards Page
      ↓
rewardService.redeem()
      ↓
API: POST /rewards/redeem
      ↓
protect middleware
      ↓
rewardController: redeemReward()
      ↓
Check: availablePoints >= pointsRequired
      ↓
Generate unique redeemCode
      ↓
Redemption Model: create()
      ↓
User Model: deductPoints()
      ↓
Return redemption code
      ↓
Display success with code
```

---

## 📊 File Count Summary

- **Total Files**: ~40+
- **Backend Files**: ~20+
- **Frontend Files**: ~20+
- **Configuration/Docs**: 6+

---

## 🚀 Module Dependencies

**Backend Dependencies:**
- express: Web framework
- mongoose: Database ODM
- bcryptjs: Password hashing
- jsonwebtoken: Authentication
- cors: Cross-origin requests
- dotenv: Environment variables

**Frontend Dependencies:**
- react: UI library
- react-router-dom: Routing
- axios: HTTP client
- chart.js: Charts (ready for use)
- react-chartjs-2: Chart integration

---

This structure provides clear separation of concerns, making the codebase maintainable, testable, and scalable!
