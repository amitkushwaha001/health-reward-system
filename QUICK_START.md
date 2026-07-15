# Health Reward Management System - QUICK START

Get the application running in 5 minutes!

## 📋 Prerequisites Check

Before starting, ensure you have:
- [ ] Node.js v14+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] MongoDB Atlas account or local MongoDB running

## ⚡ 5-Minute Setup

### Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env - Add your MongoDB URI
# IMPORTANT: Update MONGODB_URI in .env
```

**If using MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Paste into MONGODB_URI in .env

**If using Local MongoDB:**
- Make sure mongod is running
- Use: `MONGODB_URI=mongodb://localhost:27017/health-reward-system`

### Step 2: Start Backend

```bash
# Terminal 1
cd backend
npm run dev
```

✅ Backend should start at http://localhost:5000

### Step 3: Frontend Setup (2 minutes)

```bash
# Terminal 2
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_BASE_URL=http://localhost:5000/api" > .env
```

### Step 4: Start Frontend

```bash
# Terminal 2 (same terminal as above)
npm start
```

✅ Frontend should open at http://localhost:3000

### Step 5: Seed Sample Data (Optional - 1 minute)

```bash
# Terminal 3
cd backend
node seed.js
```

✅ Sample users, steps, and rewards created!

## 🎯 Test the Application

### Demo Credentials

After seeding, login with:

**Regular User:**
- Email: `john@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@healthreward.com`
- Password: `AdminPassword123`

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] No CORS errors in browser console
- [ ] Can login with demo credentials
- [ ] Dashboard displays user data
- [ ] Can add steps and see points calculated

## 🆘 Quick Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check MongoDB connection string in .env
# Verify MongoDB is running (if local):
mongod

# Or check MongoDB Atlas network access settings
```

### "Port 5000 already in use"
```bash
# Kill process on port 5000:
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### "Cannot GET /api/auth/profile"
```bash
# Make sure backend is running with: npm run dev
# Frontend should call http://localhost:5000/api
# Check REACT_APP_API_BASE_URL in frontend .env
```

### "Module not found"
```bash
# Clear and reinstall:
rm -rf node_modules
npm install
```

## 📱 Next Steps

1. **Explore the UI**
   - Login as demo user
   - Add steps to test the reward system
   - View leaderboard
   - Redeem rewards

2. **Try Admin Features** (login as admin)
   - View admin dashboard
   - Manage users
   - Create new rewards
   - View reports

3. **Read Full Documentation**
   - See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for complete API reference
   - Check [README.md](README.md) for feature overview

## 🎉 Success!

If you can see the dashboard and login with demo credentials, the application is running successfully!

---

## 📝 Common Modifications

### Change Reward Conversion Rate
Edit `backend/config/constants.js`:
```javascript
STEPS_TO_POINTS_RATIO: 100 // Change this number
```

### Add Your Own User
1. Go to http://localhost:3000/register
2. Create a new account
3. You'll be logged in automatically

### Modify Reward Categories
Edit `backend/models/Reward.js` to add new categories

### Change Server Port
Edit `backend/.env`:
```
PORT=5001
```

---

**Need more help?** See docs/SETUP_GUIDE.md for detailed documentation.
