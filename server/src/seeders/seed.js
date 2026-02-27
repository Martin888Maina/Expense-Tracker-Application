require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Category } = require('../models');

// Default categories available to all users out of the box.
// These reflect common spending areas relevant to everyday Kenyan budgeting.
const defaultCategories = [
    { name: 'Food & Dining', icon: 'bi-cup-hot', color: '#E8785A', isDefault: true },
    { name: 'Transport', icon: 'bi-bus-front', color: '#5B9BD5', isDefault: true },
    { name: 'Housing & Rent', icon: 'bi-house', color: '#F5C842', isDefault: true },
    { name: 'Utilities', icon: 'bi-lightning', color: '#4ABFBF', isDefault: true },
    { name: 'Entertainment', icon: 'bi-film', color: '#B07FC8', isDefault: true },
    { name: 'Shopping', icon: 'bi-bag', color: '#F0984A', isDefault: true },
    { name: 'Healthcare', icon: 'bi-heart-pulse', color: '#E05C7A', isDefault: true },
    { name: 'Education', icon: 'bi-book', color: '#8A9BB0', isDefault: true },
    { name: 'Personal Care', icon: 'bi-scissors', color: '#6BBFA0', isDefault: true },
    { name: 'Savings', icon: 'bi-piggy-bank', color: '#45B7D1', isDefault: true },
    { name: 'M-Pesa Charges', icon: 'bi-phone', color: '#4CAF50', isDefault: true },
    { name: 'Other', icon: 'bi-three-dots', color: '#A0A0A0', isDefault: true },
];

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database. Starting seed...');

        // Sync tables before inserting — alter:true keeps existing data intact
        await sequelize.sync({ alter: true });

        let created = 0;
        let skipped = 0;

        for (const cat of defaultCategories) {
            // findOrCreate is safe to run multiple times — skips rows that already exist
            const [, wasCreated] = await Category.findOrCreate({
                where: { name: cat.name, userId: null },
                defaults: cat,
            });
            wasCreated ? created++ : skipped++;
        }

        console.log(`Seed complete: ${created} categories created, ${skipped} already existed.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
