const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');

const categories = ['Food', 'Transport', 'Salary', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Other'];

const getRandomAmount = (isIncome) => {
    if (isIncome) {
        return Math.floor(Math.random() * 3000) + 1000; // 1000 to 4000
    }
    return -(Math.floor(Math.random() * 500) + 10); // -10 to -510
};

const getRandomDate = () => {
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const diff = now.getTime() - sixMonthsAgo.getTime();
    return new Date(sixMonthsAgo.getTime() + Math.random() * diff);
};

const descriptions = {
    Food: ['Lunch', 'Dinner', 'Groceries', 'Coffee', 'Restaurant', 'Takeout'],
    Transport: ['Uber', 'Gas', 'Bus pass', 'Train ticket', 'Parking', 'Car wash'],
    Salary: ['Monthly salary', 'Bonus', 'Freelance work', 'Side project'],
    Entertainment: ['Netflix', 'Movies', 'Concert', 'Games', 'Books', 'Spotify'],
    Shopping: ['Clothes', 'Electronics', 'Amazon', 'Home decor', 'Gifts'],
    Bills: ['Electricity', 'Internet', 'Phone', 'Rent', 'Insurance', 'Water'],
    Healthcare: ['Doctor', 'Pharmacy', 'Gym membership', 'Vitamins'],
    Other: ['Miscellaneous', 'ATM withdrawal', 'Bank fee', 'Donation']
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Transaction.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const user1 = await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password: 'password123',
            role: 'user'
        });

        const user2 = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        console.log('Created users');

        // Create transactions for user1
        const transactions = [];

        // Add some income transactions
        for (let i = 0; i < 6; i++) {
            transactions.push({
                userId: user1._id,
                text: descriptions.Salary[Math.floor(Math.random() * descriptions.Salary.length)],
                amount: getRandomAmount(true),
                category: 'Salary',
                date: getRandomDate()
            });
        }

        // Add expense transactions
        for (let i = 0; i < 44; i++) {
            const category = categories.filter(c => c !== 'Salary')[Math.floor(Math.random() * 7)];
            const descList = descriptions[category];
            transactions.push({
                userId: user1._id,
                text: descList[Math.floor(Math.random() * descList.length)],
                amount: getRandomAmount(false),
                category,
                date: getRandomDate()
            });
        }

        await Transaction.insertMany(transactions);
        console.log(`Created ${transactions.length} transactions`);

        console.log('\n✅ Seed completed successfully!');
        console.log('\nTest accounts:');
        console.log('  Email: user@test.com | Password: password123');
        console.log('  Email: admin@test.com | Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
