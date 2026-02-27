const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A Budget sets a spending limit for a specific category within a given time period.
// The unique constraint on [userId, categoryId, period] ensures only one active budget
// per category per period per user.
const Budget = sequelize.define(
    'Budget',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                min: { args: [0.01], msg: 'Budget amount must be greater than zero' },
            },
        },
        period: {
            type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
            defaultValue: 'monthly',
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: 'budgets',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'categoryId', 'period'],
                // Enforced at the database level to prevent duplicate budget entries
            },
        ],
    }
);

module.exports = Budget;
