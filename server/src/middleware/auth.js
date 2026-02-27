const jwt = require('jsonwebtoken');
const { User } = require('../models');

// This middleware verifies the JWT token on every protected route.
// It checks both the Authorization header (Bearer token) and httpOnly cookies.
const authenticate = async (req, res, next) => {
    try {
        let token = null;

        // First try to get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // If not in the header, check for a token in the cookie jar
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: { message: 'Access denied. Please log in to continue.' },
            });
        }

        // Verify the token signature and check that it hasn't expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Look up the user to make sure the account still exists
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { message: 'The account associated with this token no longer exists.' },
            });
        }

        // Attach the user object to the request so downstream handlers can use it
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: { message: 'Your session has expired. Please log in again.' },
            });
        }
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid authentication token.' },
        });
    }
};

module.exports = authenticate;
