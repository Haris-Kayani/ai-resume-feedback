import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { Experiment } from '../models/Experiment.js'
import { ExperimentRun } from '../models/ExperimentRun.js'
import { AnalysisRun } from '../models/AnalysisRun.js'

const router = Router()

const createSchema = z.object({
  name: z.string().min(1).max(120),
  jobDescriptionId: z.string().min(1),
  runAId: z.string().min(1),
  runBId: z.string().min(1),
})

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid input' })
    return
  }

  const [runA, runB] = await Promise.all([
    AnalysisRun.findOne({ _id: parsed.data.runAId, userId: req.userId }).lean(),
    AnalysisRun.findOne({ _id: parsed.data.runBId, userId: req.userId }).lean(),
  ])

  if (!runA || !runB) {
    res.status(404).json({ success: false, error: 'Run not found' })
    return
  }

  const experiment = await Experiment.create({
    userId: req.userId,
    jobDescriptionId: parsed.data.jobDescriptionId,
    name: parsed.data.name,
  })

  const comparison = {
    scoreDelta: runB.overallScore - runA.overallScore,
    a: { runId: runA._id.toString(), overallScore: runA.overallScore, metrics: runA.metrics },
    b: { runId: runB._id.toString(), overallScore: runB.overallScore, metrics: runB.metrics },
  }

  const experimentRun = await ExperimentRun.create({
    experimentId: experiment._id.toString(),
    runAId: runA._id.toString(),
    runBId: runB._id.toString(),
    comparison,
  })

  res.json({ success: true, experimentId: experiment._id.toString(), experimentRunId: experimentRun._id.toString(), comparison })
})

export default router

