import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { AnalysisRun } from '../models/AnalysisRun.js';
import { createUnifiedDiff } from '../services/diff.js';
const router = Router();
const schema = z.object({
    baseRunId: z.string().min(1),
    compareRunId: z.string().min(1),
});
router.post('/', requireAuth, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ success: false, error: 'Invalid input' });
        return;
    }
    const [base, compare] = await Promise.all([
        AnalysisRun.findOne({ _id: parsed.data.baseRunId, userId: req.userId }).lean(),
        AnalysisRun.findOne({ _id: parsed.data.compareRunId, userId: req.userId }).lean(),
    ]);
    if (!base || !compare) {
        res.status(404).json({ success: false, error: 'Run not found' });
        return;
    }
    const unified = createUnifiedDiff({
        baseText: base.resumeTextSnapshot,
        compareText: compare.resumeTextSnapshot,
        baseLabel: `run-${base._id.toString()}`,
        compareLabel: `run-${compare._id.toString()}`,
    });
    const scoreDelta = compare.overallScore - base.overallScore;
    const metricDeltas = {};
    const baseMetrics = base.metrics;
    const compareMetrics = compare.metrics;
    for (const k of Object.keys(baseMetrics)) {
        metricDeltas[k] = (compareMetrics[k] || 0) - (baseMetrics[k] || 0);
    }
    res.json({
        success: true,
        diff: {
            baseRunId: base._id.toString(),
            compareRunId: compare._id.toString(),
            scoreDelta,
            metricDeltas,
            unifiedDiff: unified,
        },
    });
});
export default router;
//# sourceMappingURL=diff.js.map