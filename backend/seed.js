const mongoose = require('mongoose');
const User = require('./models/User');
const Step = require('./models/Step');
const Reward = require('./models/Reward');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Step.deleteMany({});
    await Reward.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@healthreward.com',
        password: 'AdminPassword123',
        role: 'admin',
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 50000,
        totalPoints: 500,
        availablePoints: 250,
        redeemedPoints: 250,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 45000,
        totalPoints: 450,
        availablePoints: 300,
        redeemedPoints: 150,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 38000,
        totalPoints: 380,
        availablePoints: 280,
        redeemedPoints: 100,
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 65000,
        totalPoints: 650,
        availablePoints: 400,
        redeemedPoints: 250,
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 72000,
        totalPoints: 720,
        availablePoints: 500,
        redeemedPoints: 220,
      },
      {
        name: 'Emma Davis',
        email: 'emma@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 55000,
        totalPoints: 550,
        availablePoints: 320,
        redeemedPoints: 230,
      },
      {
        name: 'Oliver Taylor',
        email: 'oliver@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 48000,
        totalPoints: 480,
        availablePoints: 250,
        redeemedPoints: 230,
      },
      {
        name: 'Sophia Anderson',
        email: 'sophia@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 80000,
        totalPoints: 800,
        availablePoints: 600,
        redeemedPoints: 200,
      },
      {
        name: 'Liam Martinez',
        email: 'liam@example.com',
        password: 'password123',
        role: 'user',
        totalSteps: 42000,
        totalPoints: 420,
        availablePoints: 200,
        redeemedPoints: 220,
      },
    ]);

    console.log('Users created:', users.length);

    // Create sample steps
    const steps = await Step.create([
      {
        userId: users[1]._id,
        date: new Date('2024-05-25'),
        steps: 8500,
        pointsEarned: 85,
      },
      {
        userId: users[1]._id,
        date: new Date('2024-05-26'),
        steps: 9200,
        pointsEarned: 92,
      },
      {
        userId: users[2]._id,
        date: new Date('2024-05-25'),
        steps: 7800,
        pointsEarned: 78,
      },
      {
        userId: users[2]._id,
        date: new Date('2024-05-26'),
        steps: 8100,
        pointsEarned: 81,
      },
      {
        userId: users[3]._id,
        date: new Date('2024-05-25'),
        steps: 6500,
        pointsEarned: 65,
      },
      {
        userId: users[4]._id,
        date: new Date('2024-05-25'),
        steps: 10000,
        pointsEarned: 100,
      },
      {
        userId: users[4]._id,
        date: new Date('2024-05-26'),
        steps: 9500,
        pointsEarned: 95,
      },
    ]);

    console.log('Steps created:', steps.length);

    // Create sample rewards
    const rewards = await Reward.create([
      {
        title: '₹10 Cash Reward',
        category: 'CASH',
        pointsRequired: 100,
        value: 10,
        currency: '₹',
        description: 'Get ₹10 cashback directly to your wallet',
      },
      {
        title: '₹100 Shopping Voucher',
        category: 'SHOPPING_VOUCHER',
        pointsRequired: 1000,
        value: 100,
        currency: '₹',
        description: 'Use this voucher at popular online shopping platforms',
      },
      {
        title: 'Movie Ticket',
        category: 'MOVIE_TICKET',
        pointsRequired: 500,
        value: 1,
        description: 'Get one movie ticket to watch your favorite film',
      },
      {
        title: '₹50 Food Coupon',
        category: 'FOOD_COUPON',
        pointsRequired: 300,
        value: 50,
        currency: '₹',
        description: 'Enjoy a ₹50 discount on your favorite food delivery app',
      },
      {
        title: '₹20 Cash Reward',
        category: 'CASH',
        pointsRequired: 200,
        value: 20,
        currency: '₹',
        description: 'Get ₹20 cashback directly to your wallet',
      },
      {
        title: '₹50 Shopping Voucher',
        category: 'SHOPPING_VOUCHER',
        pointsRequired: 500,
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
