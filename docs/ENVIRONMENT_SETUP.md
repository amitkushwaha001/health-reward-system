# Environment Variables Template

Copy these files to set up your environment.

## Backend .env

Create `backend/.env`:

```env
# =================================
# DATABASE CONFIGURATION
# =================================

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/health-reward-system?retryWrites=true&w=majority

# Local MongoDB (alternative)
# MONGODB_URI=mongodb://localhost:27017/health-reward-system


# =================================
# SERVER CONFIGURATION
# =================================

# Server port
PORT=5000

# Environment mode
NODE_ENV=development


# =================================
# JWT CONFIGURATION
# =================================

# Secret key for JWT signing (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345

# Token expiration
JWT_EXPIRE=7d


# =================================
# REWARD CONFIGURATION
# =================================

# Points conversion (100 steps = 1 point)
STEPS_TO_POINTS_RATIO=100

# Cash redemption rate (1 point = ₹0.1)
CASH_REDEMPTION_RATE=0.1


# =================================
# EMAIL CONFIGURATION (Optional)
# =================================
# For future email notifications feature

# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password


# =================================
# ADMIN CONFIGURATION
# =================================

# Default admin credentials (for seeding)
ADMIN_EMAIL=admin@healthreward.com
ADMIN_PASSWORD=AdminPassword123
```

## Frontend .env

Create `frontend/.env`:

```env
# API Base URL
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## MongoDB Atlas Setup (Recommended)

### Steps to Create MongoDB Atlas Cluster:

1. **Go to** https://www.mongodb.com/cloud/atlas
2. **Sign up** with your email
3. **Create Organization** (if first time)
4. **Create Project** (e.g., "Health Reward System")
5. **Create Cluster**
   - Select M0 (Free Tier)
   - Choose region (closest to you)
   - Create Cluster
6. **Create Database User**
   - Go to Database Access
   - Add Database User
   - Username: `healthreward`
   - Password: Generate password
   - Add User
7. **Configure Network Access**
   - Go to Network Access
   - Add IP Address
   - Select "Allow Access from Anywhere" (for development)
   - Or Add specific IPs
8. **Get Connection String**
   - Go to Clusters
   - Click "Connect" button
   - Select "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password

Example: 
```
mongodb+srv://healthreward:your_password@cluster0.mxyz123.mongodb.net/health-reward-system?retryWrites=true&w=majority
```

## Local MongoDB Setup

### Windows:
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. Follow setup wizard
4. Start MongoDB service

### Mac (Using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
Follow instructions at https://docs.mongodb.com/manual/administration/install-on-linux/

After installation:
```bash
mongod
# Server runs on mongodb://localhost:27017
```

## Environment Variables Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| MONGODB_URI | Database connection string | mongodb+srv://user:pass@cluster.net/db |
| PORT | Server port | 5000 |
| NODE_ENV | Development or production | development |
| JWT_SECRET | Secret key for tokens | any_random_string |
| JWT_EXPIRE | How long tokens last | 7d |
| STEPS_TO_POINTS_RATIO | Steps to points conversion | 100 |
| REACT_APP_API_BASE_URL | Backend API URL | http://localhost:5000/api |

## Security Best Practices

### For Development:
- Use simple credentials
- Store in `.env` (never commit!)
- Use local MongoDB for testing

### For Production:
- Generate strong JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Use strong database password
- Use MongoDB Atlas IP whitelisting
- Set NODE_ENV=production
- Use HTTPS/SSL
- Never expose .env file
- Rotate JWT_SECRET periodically

## Common Issues

### "Cannot read environment variables"
- Make sure you have `.env` file in correct directory
- Run `npm install dotenv`
- Check spelling of variable names

### "MongoDB connection timeout"
- Verify connection string in MONGODB_URI
- Check network access in MongoDB Atlas
- Ensure MongoDB service is running (if local)
- Wait a moment for cluster to initialize

### "JWT token errors"
- Make sure JWT_SECRET is set in .env
- Check that token is being sent in headers
- Verify JWT_SECRET is same on backend

---

**Remember:** Never commit `.env` files to version control!
