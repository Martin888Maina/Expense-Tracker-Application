const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// The User model stores account credentials and preferences.
// Each user has their own isolated set of expenses, budgets, and custom categories.
const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Name cannot be empty' },
                len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: 'Please provide a valid email address' },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            // We never return the raw password; it is always bcrypt-hashed before saving
        },
        currency: {
            type: DataTypes.STRING(10),
            defaultValue: 'KES',
            allowNull: false,
        },
        theme: {
            type: DataTypes.ENUM('light', 'dark'),
            defaultValue: 'light',
        },
    },
    {
        tableName: 'users',
        timestamps: true,
        // Never expose the hashed password in JSON responses
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] },
            },
        },
    }
);

module.exports = User;
