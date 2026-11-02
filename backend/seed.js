const mongoose = require('mongoose');
const User = require('./models/User');
const Step = require('./models/Step');
const Reward = require('./models/Reward');
require('dotenv').config();

const seedDatabase = async () => {
  if (process.env.NODE_ENV !== 'development' || process.env.SEED_DEMO_DATA !== 'true') {
    throw new Error('Demo seeding is disabled. Set NODE_ENV=development and SEED_DEMO_DATA=true for a local development database only.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured for local demo seeding');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // This opt-in development utility intentionally replaces its local demo dataset.
    await User.deleteMany({});
    await Step.deleteMany({});
    await Reward.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 50000,
        totalPoints: 500000,
        availablePoints: 250000,
        redeemedPoints: 250000,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 45000,
        totalPoints: 450000,
        availablePoints: 300000,
        redeemedPoints: 150000,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 38000,
        totalPoints: 380000,
        availablePoints: 280000,
        redeemedPoints: 100000,
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 65000,
        totalPoints: 650000,
        availablePoints: 400000,
        redeemedPoints: 250000,
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 72000,
        totalPoints: 720000,
        availablePoints: 500000,
        redeemedPoints: 220000,
      },
      {
        name: 'Emma Davis',
        email: 'emma@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 55000,
        totalPoints: 550000,
        availablePoints: 320000,
        redeemedPoints: 230000,
      },
      {
        name: 'Oliver Taylor',
        email: 'oliver@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 48000,
        totalPoints: 480000,
        availablePoints: 250000,
        redeemedPoints: 230000,
      },
      {
        name: 'Sophia Anderson',
        email: 'sophia@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 80000,
        totalPoints: 800000,
        availablePoints: 600000,
        redeemedPoints: 200000,
      },
      {
        name: 'Liam Martinez',
        email: 'liam@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 42000,
        totalPoints: 420000,
        availablePoints: 200000,
        redeemedPoints: 220000,
      },
    ]);

    console.log('Users created:', users.length);

    // Create sample steps
    const steps = await Step.create([
      {
        userId: users[0]._id,
        date: new Date('2024-05-25'),
        steps: 8500,
        pointsEarned: 85000,
      },
      {
        userId: users[0]._id,
        date: new Date('2024-05-26'),
        steps: 9200,
        pointsEarned: 92000,
      },
      {
        userId: users[1]._id,
        date: new Date('2024-05-25'),
        steps: 7800,
        pointsEarned: 78000,
      },
      {
        userId: users[1]._id,
        date: new Date('2024-05-26'),
        steps: 8100,
        pointsEarned: 81000,
      },
      {
        userId: users[2]._id,
        date: new Date('2024-05-25'),
        steps: 6500,
        pointsEarned: 65000,
      },
      {
        userId: users[3]._id,
        date: new Date('2024-05-25'),
        steps: 10000,
        pointsEarned: 100000,
      },
      {
        userId: users[3]._id,
        date: new Date('2024-05-26'),
        steps: 9500,
        pointsEarned: 95000,
      },
    ]);

    console.log('Steps created:', steps.length);

    // Create sample rewards
    const rewards = await Reward.create([
      {
        title: '₹10 Cash Reward',
        category: 'CASH',
        pointsRequired: 1000,
        value: 10,
        currency: '₹',
        description: 'Get ₹10 cashback directly to your wallet',
      },
      {
        title: '₹100 Shopping Voucher',
        category: 'SHOPPING_VOUCHER',
        pointsRequired: 10000,
        value: 100,
        currency: '₹',
        description: 'Use this voucher at popular online shopping platforms',
      },
      {
        title: 'Movie Ticket',
        category: 'MOVIE_TICKET',
        pointsRequired: 5000,
        value: 1,
        description: 'Get one movie ticket to watch your favorite film',
      },
      {
        title: '₹50 Food Coupon',
        category: 'FOOD_COUPON',
        pointsRequired: 5000,
        value: 50,
        currency: '₹',
        description: 'Enjoy a ₹50 discount on your favorite food delivery app',
      },
      {
        title: '₹20 Cash Reward',
        category: 'CASH',
        pointsRequired: 2000,
        value: 20,
        currency: '₹',
        description: 'Get ₹20 cashback directly to your wallet',
      },
      {
        title: '₹50 Shopping Voucher',
        category: 'SHOPPING_VOUCHER',
        pointsRequired: 5000,
        value: 50,
        currency: '₹',
        description: 'Use this voucher for your shopping needs',
      },
    ]);

    console.log('Rewards created:', rewards.length);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
