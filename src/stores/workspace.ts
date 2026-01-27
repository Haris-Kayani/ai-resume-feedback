import { create } from 'zustand'
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from '@/utils/api'

export type Resume = {
  id: string
  displayName: string
  fileType: 'pdf' | 'docx'
  sizeBytes: number
  createdAt: string
  extractedAt?: string
}

export type JobDescription = {
  id: string
  title: string
  contentRich?: string
  contentPlain?: string
  updatedAt: string
  createdAt: string
}

export type AnalysisRunListItem = {
  id: string
  resumeId: string
  jobDescriptionId: string
  overallScore: number
  metrics: Record<string, number>
  createdAt: string
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return fallback
}

type WorkspaceState = {
  resumes: Resume[]
  jobDescriptions: JobDescription[]
  runs: AnalysisRunListItem[]
  activeResumeId: string | null
  activeJobDescriptionId: string | null
  loading: boolean
  error: string | null
  refreshAll: () => Promise<void>
  uploadResume: (file: File) => Promise<void>
  deleteResume: (resumeId: string) => Promise<void>
  loadJobDescription: (id: string) => Promise<JobDescription>
  createJobDescription: (payload: { title: string; contentRich: string; contentPlain: string }) => Promise<string>
  updateJobDescription: (id: string, payload: { title: string; contentRich: string; contentPlain: string }) => Promise<void>
  runAnalysis: (resumeId: string, jobDescriptionId: string) => Promise<string>
  setActiveResumeId: (id: string | null) => void
  setActiveJobDescriptionId: (id: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  resumes: [],
  jobDescriptions: [],
  runs: [],
  activeResumeId: null,
  activeJobDescriptionId: null,
  loading: false,
  error: null,
  refreshAll: async () => {
    set({ loading: true, error: null })
    try {
      const [resumes, jds, runs] = await Promise.all([
        apiGet<{ success: true; resumes: Resume[] }>('/api/resumes'),
        apiGet<{ success: true; jobDescriptions: JobDescription[] }>('/api/job-descriptions'),
        apiGet<{ success: true; runs: AnalysisRunListItem[] }>('/api/analysis/runs'),
      ])
      set({
        resumes: resumes.resumes,
        jobDescriptions: jds.jobDescriptions,
        runs: runs.runs,
        loading: false,
      })
    } catch (e: unknown) {
      set({ error: getErrorMessage(e, 'Failed to load data'), loading: false })
    }
  },
  uploadResume: async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    await apiUpload<{ success: true }>('/api/resumes/upload', fd)
    await get().refreshAll()
  },
  deleteResume: async (resumeId) => {
    await apiDelete<{ success: true }>(`/api/resumes/${resumeId}`)
    const state = get()
    if (state.activeResumeId === resumeId) set({ activeResumeId: null })
    await get().refreshAll()
  },
  loadJobDescription: async (id) => {
    const res = await apiGet<{ success: true; jobDescription: JobDescription }>(`/api/job-descriptions/${id}`)
    return res.jobDescription
  },
  createJobDescription: async (payload) => {
    const res = await apiPost<{ success: true; jobDescription: { id: string } }>('/api/job-descriptions', payload)
    await get().refreshAll()
    return res.jobDescription.id
  },
  updateJobDescription: async (id, payload) => {
    await apiPut<{ success: true }>(`/api/job-descriptions/${id}`, payload)
    await get().refreshAll()
  },
  runAnalysis: async (resumeId, jobDescriptionId) => {
    const res = await apiPost<{ success: true; runId: string }>('/api/analysis/run', { resumeId, jobDescriptionId })
    await get().refreshAll()
    return res.runId
  },
  setActiveResumeId: (id) => set({ activeResumeId: id }),
  setActiveJobDescriptionId: (id) => set({ activeJobDescriptionId: id }),
}))
