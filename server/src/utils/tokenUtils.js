const jwt = require('jsonwebtoken');

// Generate a signed JWT for a given user.
// The payload only includes the user's id — we re-fetch the full user record
// in the auth middleware so that any profile changes are picked up immediately.
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Set the JWT as an httpOnly cookie so that it's not accessible from JavaScript
// on the client side — this protects against XSS attacks.
const setTokenCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
};

// Remove the token cookie to log the user out
const clearTokenCookie = (res) => {
    res.clearCookie('token', { httpOnly: true });
};

module.exports = { generateToken, setTokenCookie, clearTokenCookie };
