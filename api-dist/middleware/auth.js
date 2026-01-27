import jwt from 'jsonwebtoken';
export function requireAuth(req, res, next) {
    const token = req.cookies?.ats_token;
    if (!token) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ success: false, error: 'Server misconfigured' });
        return;
    }
    try {
        const payload = jwt.verify(token, secret);
        req.userId = payload.userId;
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
}
//# sourceMappingURL=auth.js.map