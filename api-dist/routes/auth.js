import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(200),
});
function setAuthCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('ats_token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
}
router.post('/register', async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid input' });
        return;
    }
    const { email, password } = parsed.data;
    const existing = await User.findOne({ email }).lean();
    if (existing) {
        res.status(409).json({ success: false, error: 'Email already registered' });
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ success: false, error: 'Server misconfigured' });
        return;
    }
    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.json({ success: true, user: { id: user._id.toString(), email } });
});
router.post('/login', async (req, res) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid input' });
        return;
    }
    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ success: false, error: 'Server misconfigured' });
        return;
    }
    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '7d' });
    setAuthCookie(res, token);
    res.json({ success: true, user: { id: user._id.toString(), email } });
});
router.post('/logout', async (req, res) => {
    res.clearCookie('ats_token', { path: '/' });
    res.json({ success: true });
});
router.get('/me', requireAuth, async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }
    res.json({ success: true, user: { id: user._id.toString(), email: user.email } });
});
export default router;
//# sourceMappingURL=auth.js.map