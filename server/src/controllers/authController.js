const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenUtils');

// Register a new user account
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if an account with this email already exists
        const existing = await User.scope('withPassword').findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: { message: 'An account with this email address already exists.' },
            });
        }

        // Hash the password before saving — we use 12 rounds which balances security and performance
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({ name, email, password: hashedPassword });

        // Issue a JWT and set it in an httpOnly cookie so the client is automatically logged in
        const token = generateToken(user.id);
        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            data: { user: { id: user.id, name: user.name, email: user.email, currency: user.currency }, token },
        });
    } catch (error) {
        next(error);
    }
};

// Log in an existing user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Need the hashed password for comparison, so use the withPassword scope
        const user = await User.scope('withPassword').findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password.' },
            });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: { message: 'Invalid email or password.' },
            });
        }

        const token = generateToken(user.id);
        setTokenCookie(res, token);

        res.json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, currency: user.currency, theme: user.theme },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Log out the current user by clearing their cookie
const logout = (req, res) => {
    clearTokenCookie(res);
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
};

// Return the currently authenticated user's profile
const getMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};

// Update the user's display name, email, or preferred currency
const updateProfile = async (req, res, next) => {
    try {
        const { name, email, currency, theme } = req.body;
        const user = req.user;

        // Check that the new email is not already taken by someone else
        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    error: { message: 'This email address is already in use by another account.' },
                });
            }
        }

        await user.update({ name: name || user.name, email: email || user.email, currency: currency || user.currency, theme: theme || user.theme });

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};

// Allow the user to change their password after verifying the current one
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.scope('withPassword').findByPk(req.user.id);

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: { message: 'Your current password is incorrect.' },
            });
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await user.update({ password: hashed });

        res.json({ success: true, data: { message: 'Password updated successfully.' } });
    } catch (error) {
        next(error);
    }
};

// Permanently delete the user's account after confirming their password
const deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        const user = await User.scope('withPassword').findByPk(req.user.id);

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: { message: 'Incorrect password. Account was not deleted.' },
            });
        }

        await user.destroy();
        clearTokenCookie(res);

        res.json({ success: true, data: { message: 'Your account has been permanently deleted.' } });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword, deleteAccount };
