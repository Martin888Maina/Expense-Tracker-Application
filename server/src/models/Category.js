const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Categories are used to classify expenses and link them to budgets.
// Some categories are system defaults (isDefault: true); others are created by individual users.
const Category = sequelize.define(
    'Category',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Category name cannot be empty' },
            },
        },
        icon: {
            // Bootstrap icon class name, e.g. "bi-cup-hot"
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        color: {
            // Hex color code used in charts, e.g. "#FF6384"
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        isDefault: {
            // Default categories are available to everyone and cannot be deleted
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isHidden: {
            // Users can hide default categories they don't use without deleting them
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        userId: {
            // Null means this is a system-wide default category
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        tableName: 'categories',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId'],
                // This ensures each user cannot create two categories with the same name,
                // but default categories with the same name can coexist across users
                where: { userId: { [require('sequelize').Op.ne]: null } },
            },
        ],
    }
);

module.exports = Category;
