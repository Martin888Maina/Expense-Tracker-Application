const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');
const Budget = require('./Budget');

// --- Define all model associations here ---
// Keeping associations in one place makes the relationship map easy to read and maintain.

// A user can have many expenses; deleting a user removes all their expenses
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A user can have many budgets
User.hasMany(Budget, { foreignKey: 'userId', as: 'budgets', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// A user can create their own custom categories
User.hasMany(Category, { foreignKey: 'userId', as: 'categories', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Each expense is linked to a single category
Category.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Each budget targets a single category
Category.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });
Budget.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = { sequelize, User, Category, Expense, Budget };
