/**
 * This is a API server
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import resumesRoutes from './routes/resumes.js';
import jobDescriptionRoutes from './routes/jobDescriptions.js';
import analysisRoutes from './routes/analysis.js';
import diffRoutes from './routes/diff.js';
import experimentsRoutes from './routes/experiments.js';
// load env
dotenv.config();
const app = express();
const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
app.use(cors({
    origin: clientOrigin,
if (!process.env.DISABLE_RATE_LIMIT) {
    app.use(rateLimit({
        windowMs: 60_000,
        limit: 120,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
    }));
}
    standardHeaders: 'draft-7',
    legacyHeaders: false,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/diff', diffRoutes);
app.use('/api/experiments', experimentsRoutes);
/**
 * health
 */
app.use('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'ok',
    });
});
if (process.env.NODE_ENV === 'production') {
    const distPath = fileURLToPath(new URL('../dist', import.meta.url));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(fileURLToPath(new URL('../dist/index.html', import.meta.url)));
    });
}
/**
 * error handler middleware
 */
app.use((error, req, res) => {
    res.status(500).json({
        success: false,
        error: 'Server internal error',
    });
});
/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'API not found',
    });
});
export default app;
//# sourceMappingURL=app.js.map