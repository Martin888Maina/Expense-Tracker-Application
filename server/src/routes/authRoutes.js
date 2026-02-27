const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../schemas/authSchema');
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    deleteAccount,
} = require('../controllers/authController');

// Public routes — no authentication required
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

// Protected routes — must be logged in
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);
router.delete('/account', authenticate, deleteAccount);

module.exports = router;
