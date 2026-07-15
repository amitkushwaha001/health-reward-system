# Development Guide & Module Documentation

## 🛠️ Development Environment Setup

### IDE Recommendations
- **Visual Studio Code** (Recommended)
- **WebStorm** (Full-featured)
- **Sublime Text** (Lightweight)

### VS Code Extensions
```
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- MongoDB for VS Code
- Thunder Client (API testing)
- REST Client
```

### Installing Extensions
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension mongodb.mongodb-vscode
```

---

## 📦 Backend Modules

### Authentication Module (`authController.js`)

#### Register Function
```javascript
// POST /api/auth/register
- Takes: name, email, password, confirmPassword
- Returns: JWT token + user data
- Password hashed before storing
- No duplicate emails allowed
```

**Usage:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

#### Login Function
```javascript
// POST /api/auth/login
- Takes: email, password
- Returns: JWT token + user data
- Checks user existence
- Verifies password with bcrypt
- Blocks if user isBlocked
```

**Usage:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Steps Module (`stepController.js`)

#### Key Calculations
```javascript
// Points earned = steps / 100 (rounded down)
const pointsEarned = Math.floor(steps / STEPS_TO_POINTS_RATIO);

// User stats updated automatically
user.totalSteps += steps;
user.totalPoints += pointsEarned;
user.availablePoints += pointsEarned;
```

#### Step Record Update Logic
```javascript
if (existingRecord) {
  // If date already exists, update existing record
  oldPoints = existingRecord.pointsEarned;
  adjustUserStats(newPoints - oldPoints);
} else {
  // Create new record
  createNewRecord();
  addToUserStats(newPoints);
}
```

---

### Reward Module (`rewardController.js`)

#### Reward Categories
```javascript
{
  CASH: { pointsRequired: 100, value: 10 },
  MOVIE_TICKET: { pointsRequired: 500, value: 1 },
  SHOPPING_VOUCHER: { pointsRequired: 1000, value: 100 },
  FOOD_COUPON: { pointsRequired: 300, value: 50 }
}
```

#### Redemption Process
```
1. Validate: user.availablePoints >= reward.pointsRequired
2. Generate: unique redeemCode (e.g., "RDM1A2B3C4D")
3. Create: Redemption document
4. Update: Deduct from availablePoints, add to redeemedPoints
5. Return: Redemption code to user
```

---

### Admin Module (`adminController.js`)

#### Dashboard Stats Aggregation
```javascript
// Count unique users
totalUsers = User.countDocuments({ role: 'user' })

// Sum all steps
totalSteps = Step.aggregate([{ $group: { total: $sum: steps } }])

// Sum all generated points
totalRewardsGenerated = Step.aggregate([{ $group: { total: $sum: pointsEarned } }])

// Count completed redemptions
totalRedemptions = Redemption.countDocuments({ status: 'approved' })
```

#### User Management
- Search users by name or email (case-insensitive)
- Block users (prevent login)
- Delete users (cascade deletes steps + redemptions)

---

## 🎨 Frontend Components

### Protected Route Pattern
```jsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Checks:
// 1. User is authenticated (has token)
// 2. User role matches requirement
// 3. Redirects to /login or /dashboard if not authorized
```

### Form Handling Pattern
```jsx
const [formData, setFormData] = useState({
  date: '',
  steps: ''
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await stepService.addSteps(formData);
    setMessage(response.data.message);
    // Reset form
  } catch (err) {
    setError(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

### API Call Pattern
```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await leaderboardService.getLeaderboard();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []); // Empty dependency = run once on mount
```

---

## 🔐 Security Implementation Details

### Password Hashing (Bcrypt)
```javascript
// During registration/password change:
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(plainPassword, salt);

// During login:
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

### JWT Token Generation
```javascript
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);
```

### Token Verification Middleware
```javascript
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // Attach to request
```

### Authorization Check
```javascript
// Middleware to ensure only admins can access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};
```

---

## 📊 Database Query Patterns

### Finding User with Password Field
```javascript
// Password is excluded by default (select: false)
// To get password, explicitly select it:
const user = await User.findById(id).select('+password');
```

### Aggregation for Leaderboard
```javascript
const users = await User.find({ role: 'user', isBlocked: false })
  .select('name totalSteps totalPoints')
  .sort({ totalPoints: -1, totalSteps: -1 })
  .limit(10)
  .lean(); // Performance optimization
```

### Aggregation for Stats
```javascript
const totalSteps = await Step.aggregate([
  { $match: { userId: userId } },
  { $group: { _id: null, total: { $sum: '$steps' } } }
]);
```

### Compound Index for Performance
```javascript
// In Step model:
StepSchema.index({ userId: 1, date: 1 }, { unique: true });
// Ensures each user can only have 1 entry per date
```

---

## 🚦 Error Handling

### Backend Error Handling
```javascript
try {
  // Operation
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error
    return res.status(400).json({ message: 'Email already exists' });
  }
  if (error.name === 'ValidationError') {
    // Validation error
    return res.status(400).json({ message: error.message });
  }
  // Server error
  return res.status(500).json({ message: 'Server Error' });
}
```

### Frontend Error Handling
```jsx
try {
  const response = await apiService.login(credentials);
  // Success
} catch (err) {
  // Error response from server
  if (err.response?.status === 401) {
    setError('Invalid credentials');
  } else if (err.response?.status === 500) {
    setError('Server error. Try again later.');
  } else {
    setError(err.response?.data?.message || 'An error occurred');
  }
  
  // Network error
  if (!err.response) {
    setError('Network error. Check connection.');
  }
}
```

---

## 🔄 Common Development Workflows

### Adding a New Feature

#### 1. Backend
```
1. Create Model/Schema (if needed)
2. Create Controller function
3. Create Route(s)
4. Add Middleware (if auth required)
5. Test with Postman/cURL
```

#### 2. Frontend
```
1. Create Page component
2. Create API service calls
3. Add Route in App.js
4. Create forms/UI
5. Handle loading/error states
6. Test in browser
```

### Example: Adding "Follow User" Feature

**Backend:**
```javascript
// 1. Update User schema
UserSchema.add({ followers: [ObjectId] });

// 2. Create controller
const followUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.followers.push(req.user.id);
  await user.save();
};

// 3. Add route
router.post('/follow/:id', protect, followUser);

// 4. Test
// POST /api/user/follow/userId with token
```

**Frontend:**
```jsx
// 1. Add API service
export const followUser = (userId) => 
  api.post(`/user/follow/${userId}`);

// 2. Create component
const [isFollowing, setIsFollowing] = useState(false);

const handleFollow = async () => {
  try {
    await userService.followUser(userId);
    setIsFollowing(true);
  } catch (err) {
    setError('Failed to follow user');
  }
};

// 3. Add button
<button onClick={handleFollow} disabled={isFollowing}>
  {isFollowing ? 'Following' : 'Follow'}
</button>
```

---

## 📱 Testing API Endpoints

### Using curl
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","confirmPassword":"pass123"}'

# Get token from response, then test protected route
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create request
3. Select method (GET, POST, etc.)
4. Enter URL
5. Add headers: `Authorization: Bearer {token}`
6. Add body for POST/PUT
7. Send and view response

### Using Postman
1. Download from https://www.postman.com/downloads/
2. Import requests
3. Set up environment variables
4. Test endpoints

---

## 🎯 Best Practices

### Backend
- ✅ Use try-catch for async operations
- ✅ Validate input before processing
- ✅ Use middleware for common tasks
- ✅ Never expose sensitive data in responses
- ✅ Use async/await instead of callbacks
- ✅ Hash passwords before storing
- ✅ Use indexed fields for queries

### Frontend
- ✅ Use loading states for async operations
- ✅ Show error messages to users
- ✅ Prevent double submissions
- ✅ Validate forms on client-side
- ✅ Use React Context for shared state
- ✅ Lazy load images
- ✅ Implement error boundaries

### General
- ✅ Keep functions small and focused
- ✅ Use meaningful variable names
- ✅ Add comments for complex logic
- ✅ Don't duplicate code (DRY principle)
- ✅ Test error scenarios
- ✅ Use .env for configuration
- ✅ Version control everything

---

## 📚 Learning Resources

- **Express.js**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/
- **React**: https://react.dev/
- **JWT**: https://jwt.io/
- **Bcryptjs**: https://github.com/dcodeIO/bcrypt.js

---

This guide provides everything needed to understand and extend the application!
