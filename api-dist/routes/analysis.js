import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { Resume } from '../models/Resume.js';
import { JobDescription } from '../models/JobDescription.js';
import { AnalysisRun } from '../models/AnalysisRun.js';
import { extractTextFromDocx, extractTextFromPdf } from '../services/textExtraction.js';
import { scoreResume } from '../services/scoring.js';
const router = Router();
const runSchema = z.object({
    resumeId: z.string().min(1),
    jobDescriptionId: z.string().min(1),
});
router.get('/runs', requireAuth, async (req, res) => {
    const runs = await AnalysisRun.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({
        success: true,
        runs: runs.map((r) => ({
            id: r._id.toString(),
            resumeId: r.resumeId,
            jobDescriptionId: r.jobDescriptionId,
            overallScore: r.overallScore,
            metrics: r.metrics,
            createdAt: r.createdAt,
        })),
    });
});
router.get('/runs/:id', requireAuth, async (req, res) => {
    const run = await AnalysisRun.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!run) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
    }
    res.json({
        success: true,
        run: {
            id: run._id.toString(),
            resumeId: run.resumeId,
            jobDescriptionId: run.jobDescriptionId,
            overallScore: run.overallScore,
            metrics: run.metrics,
            recommendations: run.recommendations,
            resumeTextSnapshot: run.resumeTextSnapshot,
            jdTextSnapshot: run.jdTextSnapshot,
            createdAt: run.createdAt,
        },
    });
});
router.post('/run', requireAuth, async (req, res) => {
    const parsed = runSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid input' });
        return;
    }
    const resume = await Resume.findOne({ _id: parsed.data.resumeId, userId: req.userId });
    if (!resume) {
        res.status(404).json({ success: false, error: 'Resume not found' });
        return;
    }
    const jd = await JobDescription.findOne({ _id: parsed.data.jobDescriptionId, userId: req.userId }).lean();
    if (!jd) {
        res.status(404).json({ success: false, error: 'Job description not found' });
        return;
    }
    let resumeText = resume.extractedText;
    if (!resumeText) {
        const extracted = resume.fileType === 'pdf'
            ? await extractTextFromPdf(resume.filePath)
            : await extractTextFromDocx(resume.filePath);
        resumeText = extracted.text;
        resume.extractedText = resumeText;
        resume.extractedAt = new Date();
        await resume.save();
    }
    const scored = scoreResume({
        resumeText,
        jobDescriptionText: jd.contentPlain,
        jobTitle: jd.title,
    });
    const run = await AnalysisRun.create({
        userId: req.userId,
        resumeId: resume._id.toString(),
        jobDescriptionId: jd._id.toString(),
        overallScore: scored.overallScore,
        metrics: scored.metrics,
        recommendations: scored.recommendations,
        resumeTextSnapshot: resumeText,
        jdTextSnapshot: jd.contentPlain,
    });
    res.json({ success: true, runId: run._id.toString() });
});
export default router;
//# sourceMappingURL=analysis.js.map