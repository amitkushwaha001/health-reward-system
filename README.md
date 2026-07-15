# Health Reward Management System - README

A complete, production-ready MERN Stack application for managing health rewards and tracking fitness activities.

## 🎯 Features

### User Features
- ✅ **User Registration & Login** - Secure JWT authentication
- ✅ **Dashboard** - View stats, points, and recent activity
- ✅ **Step Management** - Log, edit, and delete daily steps
- ✅ **Reward Redemption** - Redeem points for cash, vouchers, tickets, and coupons
- ✅ **Leaderboard** - View top 10 users by points
- ✅ **Profile Management** - Update profile and change password
- ✅ **Wallet & History** - Track points and redemptions

### Admin Features
- ✅ **Admin Dashboard** - View system statistics
- ✅ **User Management** - View, block, and delete users
- ✅ **Reward Management** - Create, edit, and delete rewards
- ✅ **Reports & Analytics** - User activity, transactions, and redemption statistics

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Responsive styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
health-reward-system/
├── backend/
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Business logic
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & error handling
│   ├── config/             # Database & constants
│   ├── utils/              # Helper functions
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeding
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API calls
│   │   ├── context/        # Auth context
│   │   ├── styles/         # CSS
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
│
└── docs/
    └── SETUP_GUIDE.md      # Complete setup instructions
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev  # or node server.js
```

2. **Frontend Setup**
```bash
cd frontend
npm install
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
npm start
```

3. **Seed Sample Data (Optional)**
```bash
cd backend
node seed.js
```

### Demo Credentials
- **User:** john@example.com / password123
- **Admin:** admin@healthreward.com / AdminPassword123

## 📊 Reward System

### Points Calculation
- **100 Steps = 1 Reward Point**

Examples:
- 1,000 steps = 10 points
- 5,000 steps = 50 points
- 10,000 steps = 100 points

### Reward Categories
| Category | Points | Value | Currency |
|----------|--------|-------|----------|
| Cash | 100 | ₹10 | ₹ |
| Movie Ticket | 500 | 1 | Ticket |
| Shopping Voucher | 1000 | ₹100 | ₹ |
| Food Coupon | 300 | ₹50 | ₹ |

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes with middleware
- ✅ CORS enabled
- ✅ Role-based access control (User/Admin)
- ✅ Input validation

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Steps
- `POST /api/steps/add` - Add new steps
- `GET /api/steps/history` - Get step history
- `PUT /api/steps/update/:id` - Update steps
- `DELETE /api/steps/delete/:id` - Delete steps

### Rewards
- `GET /api/rewards` - Get all available rewards
- `POST /api/rewards/redeem` - Redeem a reward
- `GET /api/rewards/history` - Get redemption history

### Leaderboard
- `GET /api/leaderboard` - Get top 10 users
- `GET /api/leaderboard/user-rank` - Get user's rank

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users (with search)
- `DELETE /api/admin/user/:id` - Delete user
- `PATCH /api/admin/block/:id` - Block/unblock user
- `GET /api/admin/reports` - Get reports

For detailed API documentation, see [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

## 🎨 Features Highlights

### User Dashboard
- Display total steps, points, available points, and redeemed points
- Quick action buttons for common tasks
- Recent activity log

### Step Tracking
- Add steps with date selection
- Real-time point calculation
- Edit and delete functionality
- Step history with filters

### Reward System
- Browse available rewards with descriptions
- Points balance check before redemption
- Unique redemption codes for tracking
- Full redemption history

### Leaderboard
- Top 10 users ranking
- User rank and statistics
- Points and steps comparison

### Admin Panel
- System-wide statistics
- User management with search
- Reward creation and management
- Detailed reports and analytics

## 🌐 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (below 768px)

## 📈 Database Collections

1. **Users** - User accounts and statistics
2. **Steps** - Daily step records
3. **Rewards** - Available reward offers
4. **Redemptions** - User reward redemptions

## 🔄 Workflow

1. **User Registration** → Account created with 0 points
2. **Log Steps** → Points automatically calculated (100 steps = 1 point)
3. **Accumulate Points** → Total and available points increase
4. **Redeem Reward** → Select reward, points deducted, code generated
5. **Track Progress** → View leaderboard and analytics

## 🛣️ Routing

### Public Routes
- `/register` - User registration page
- `/login` - User login page

### Protected Routes (User)
- `/dashboard` - Main user dashboard
- `/steps` - Step management
- `/rewards` - Reward redemption
- `/redemption-history` - View redeemed rewards
- `/leaderboard` - User rankings
- `/profile` - User profile

### Protected Routes (Admin)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/rewards` - Reward management
- `/admin/reports` - Reports

## 📝 Environment Variables

### Backend
```
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
STEPS_TO_POINTS_RATIO=100
```

### Frontend
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Backend (Heroku/Railway)
```bash
# Add Procfile
web: node server.js

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder
```

## 📚 Documentation

- [Complete Setup Guide](./docs/SETUP_GUIDE.md) - Detailed installation and configuration
- [API Reference](./docs/SETUP_GUIDE.md#-api-documentation) - All API endpoints
- [Database Schema](./docs/SETUP_GUIDE.md#-database-schema) - Collection structures

## ✨ Future Enhancements

- [ ] Email notifications for rewards
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced analytics charts
- [ ] Push notifications
- [ ] Wearable device integration
- [ ] Referral system

## 🐛 Troubleshooting

See [SETUP_GUIDE.md - Troubleshooting](./docs/SETUP_GUIDE.md#-troubleshooting) for common issues and solutions.

## 📄 License

MIT License © 2024

## 🤝 Contributing

Feel free to fork, modify, and use this project for your needs.

---

**Made with ❤️ for Health & Fitness**

For questions or issues, refer to the setup documentation or check API response error messages.
