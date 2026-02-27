const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Each expense record tracks a single financial transaction.
// The amount is stored as DECIMAL to avoid floating-point rounding issues
// that are common with JavaScript numbers when handling currency.
const Expense = sequelize.define(
    'Expense',
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
                min: { args: [0.01], msg: 'Amount must be greater than zero' },
            },
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Description cannot be empty' },
                len: { args: [1, 200], msg: 'Description must be between 1 and 200 characters' },
            },
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        notes: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        paymentMethod: {
            // Common payment methods used in Kenya — M-Pesa is the dominant mobile money service
            type: DataTypes.ENUM('cash', 'mpesa', 'bank_transfer', 'card'),
            defaultValue: 'cash',
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
        tableName: 'expenses',
        timestamps: true,
        indexes: [
            { fields: ['userId', 'date'] },
            { fields: ['userId', 'categoryId'] },
        ],
    }
);

module.exports = Expense;
