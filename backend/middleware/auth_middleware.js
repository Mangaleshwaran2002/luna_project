import { auth } from '../lib/auth.js';
// Middleware to require authentication
const requireAuth = async (req, res, next) => {
    try {
        console.log(`\n\n\nHeaders : ${JSON.stringify(req.headers)}\n\n\n`);
        const session = await auth.api.getSession({ headers: req.headers });
        if (session && session.user) {
            // Attach user to request for downstream route handlers
            req.user = session.user;
            next(); // Proceed to the route handler
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

export default requireAuth;