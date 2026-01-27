import { nanoid } from 'nanoid'

export type AnalysisMetricKey =
  | 'keyword_coverage'
  | 'skills_match'
  | 'role_alignment'
  | 'formatting_risk'
  | 'tenure_clarity'

export type Recommendation = {
  id: string
  title: string
  rationale: string
  priority: 'high' | 'med' | 'low'
  data?: Record<string, unknown>
}

export type ScoreResult = {
  overallScore: number
  metrics: Record<AnalysisMetricKey, number>
  recommendations: Recommendation[]
  debug: {
    jdKeywordCount: number
    matchedKeywordCount: number
    missingKeywords: string[]
  }
}

const STOPWORDS = new Set(
  [
    'the',
    'a',
    'an',
    'and',
    'or',
    'to',
    'of',
    'in',
    'for',
    'with',
    'on',
    'at',
    'by',
    'from',
    'as',
    'is',
    'are',
    'was',
    'were',
    'be',
    'being',
    'been',
    'that',
    'this',
    'these',
    'those',
    'it',
    'its',
    'you',
    'your',
    'we',
    'our',
    'they',
    'their',
    'will',
    'can',
    'may',
    'must',
    'should',
    'would',
    'could',
    'not',
    'no',
    'yes',
    'if',
    'then',
    'than',
    'so',
    'such',
    'into',
    'about',
    'over',
    'under',
    'between',
    'within',
  ].map((s) => s.toLowerCase()),
)

const SKILL_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'react', re: /\breact(\.js)?\b/i },
  { label: 'typescript', re: /\btypescript\b/i },
  { label: 'javascript', re: /\bjavascript\b/i },
  { label: 'node', re: /\bnode(\.js)?\b/i },
  { label: 'express', re: /\bexpress(\.js)?\b/i },
  { label: 'mongodb', re: /\bmongo(db)?\b/i },
  { label: 'sql', re: /\bsql\b/i },
  { label: 'docker', re: /\bdocker\b/i },
  { label: 'kubernetes', re: /\bkubernetes\b|\bk8s\b/i },
  { label: 'aws', re: /\baws\b|\bamazon web services\b/i },
  { label: 'gcp', re: /\bgcp\b|\bgoogle cloud\b/i },
  { label: 'azure', re: /\bazure\b/i },
  { label: 'git', re: /\bgit\b/i },
  { label: 'ci/cd', re: /\bci\/?cd\b/i },
  { label: 'rest', re: /\brest\b|\brestful\b/i },
  { label: 'graphql', re: /\bgraphql\b/i },
  { label: 'testing', re: /\bjest\b|\bvitest\b|\btesting\b|\bunit tests?\b/i },
]

function clamp0to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function normalize(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[^a-zA-Z0-9+.#\n ]/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim()
}

function tokenizeWords(input: string): string[] {
  return normalize(input)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3)
    .filter((w) => !STOPWORDS.has(w))
}

function extractTopKeywords(jdText: string, limit: number): string[] {
  const words = tokenizeWords(jdText)
  const counts = new Map<string, number>()
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w)
}

function sectionScore(resumeText: string): { score: number; missing: string[] } {
  const t = resumeText.toLowerCase()
  const sections = [
    { key: 'summary', re: /\b(summary|profile|objective)\b/i },
    { key: 'experience', re: /\b(experience|employment|work history)\b/i },
    { key: 'skills', re: /\b(skills|technical skills)\b/i },
    { key: 'education', re: /\b(education|certifications?)\b/i },
  ]
  let score = 0
  const missing: string[] = []
  for (const s of sections) {
    if (s.re.test(t)) score += 20
    else missing.push(s.key)
  }
  return { score, missing }
}

function contactScore(resumeText: string): { score: number; missing: string[] } {
  const missing: string[] = []
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText)
  const hasPhone = /(\+?\d[\d(). -]{7,}\d)/.test(resumeText)
  let score = 0
  if (hasEmail) score += 60
  else missing.push('email')
  if (hasPhone) score += 40
  else missing.push('phone')
  return { score, missing }
}

function dateRangeScore(resumeText: string): number {
  const ranges = resumeText.match(
    /(\b(19|20)\d{2}\b\s*[-–]\s*\b(19|20)\d{2}\b)|(\b(19|20)\d{2}\b\s*[-–]\s*present\b)|(\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\b\s*[-–]\s*(present|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\b))/gi,
  )
  const count = ranges ? ranges.length : 0
  if (count >= 3) return 100
  if (count === 2) return 75
  if (count === 1) return 45
  return 10
}

function lengthScore(resumeText: string): { score: number; bucket: 'low' | 'ok' | 'high' } {
  const words = tokenizeWords(resumeText)
  const wc = words.length
  if (wc < 200) return { score: 25, bucket: 'low' }
  if (wc > 1500) return { score: 35, bucket: 'high' }
  return { score: 100, bucket: 'ok' }
}

function skillCoverage(jdText: string, resumeText: string): { jdSkills: string[]; matched: string[]; missing: string[] } {
  const jdSkills = SKILL_PATTERNS.filter((s) => s.re.test(jdText)).map((s) => s.label)
  const matched = jdSkills.filter((label) => {
    const p = SKILL_PATTERNS.find((s) => s.label === label)
    return p ? p.re.test(resumeText) : false
  })
  const missing = jdSkills.filter((s) => !matched.includes(s))
  return { jdSkills, matched, missing }
}

export function scoreResume(params: { resumeText: string; jobDescriptionText: string; jobTitle?: string }): ScoreResult {
  const resumeText = params.resumeText || ''
  const jdText = params.jobDescriptionText || ''
  const jobTitle = params.jobTitle || ''

  const jdKeywords = extractTopKeywords(`${jobTitle}\n${jdText}`, 40)
  const resumeWords = new Set(tokenizeWords(resumeText))
  const matchedKeywords = jdKeywords.filter((k) => resumeWords.has(k))
  const keywordCoverage = jdKeywords.length === 0 ? 0 : (matchedKeywords.length / jdKeywords.length) * 100

  const skills = skillCoverage(`${jobTitle}\n${jdText}`, resumeText)
  const skillsMatch = skills.jdSkills.length === 0 ? 60 : (skills.matched.length / skills.jdSkills.length) * 100

  const titleKeywords = extractTopKeywords(jobTitle, 10)
  const titleMatched = titleKeywords.filter((k) => resumeWords.has(k))
  const roleAlignment = titleKeywords.length === 0 ? 60 : (titleMatched.length / titleKeywords.length) * 100

  const sections = sectionScore(resumeText)
  const contact = contactScore(resumeText)
  const tenureClarity = dateRangeScore(resumeText)
  const length = lengthScore(resumeText)
  const formatting = (sections.score * 0.55 + contact.score * 0.25 + length.score * 0.2)

  const metrics: Record<AnalysisMetricKey, number> = {
    keyword_coverage: clamp0to100(keywordCoverage),
    skills_match: clamp0to100(skillsMatch),
    role_alignment: clamp0to100(roleAlignment),
    formatting_risk: clamp0to100(formatting),
    tenure_clarity: clamp0to100(tenureClarity),
  }

  const overallScore = clamp0to100(
    metrics.keyword_coverage * 0.4 +
      metrics.skills_match * 0.3 +
      metrics.role_alignment * 0.1 +
      metrics.formatting_risk * 0.15 +
      metrics.tenure_clarity * 0.05,
  )

  const missingKeywords = jdKeywords.filter((k) => !matchedKeywords.includes(k)).slice(0, 12)

  const recommendations: Recommendation[] = []
  if (missingKeywords.length >= 6) {
    recommendations.push({
      id: nanoid(),
      title: 'Add missing keywords from the job description',
      rationale: `You are missing ${missingKeywords.length} high-signal keywords found in the job description. Add the ones you genuinely have experience with.`,
      priority: 'high',
      data: { missingKeywords },
    })
  } else if (missingKeywords.length > 0) {
    recommendations.push({
      id: nanoid(),
      title: 'Consider adding a few relevant keywords',
      rationale: 'A small number of key terms are not present. Ensure your resume mirrors the job description vocabulary where truthful.',
      priority: 'med',
      data: { missingKeywords },
    })
  }

  if (skills.missing.length > 0) {
    recommendations.push({
      id: nanoid(),
      title: 'Reflect required skills explicitly',
      rationale: 'Some explicitly mentioned technologies/skills are not detected in your resume. Add them to Skills or relevant experience bullets if applicable.',
      priority: skills.missing.length >= 3 ? 'high' : 'med',
      data: { missingSkills: skills.missing },
    })
  }

  if (sections.missing.length > 0) {
    recommendations.push({
      id: nanoid(),
      title: 'Strengthen section structure',
      rationale: `ATS parsers perform better with standard section headers. Missing sections: ${sections.missing.join(', ')}.`,
      priority: 'med',
      data: { missingSections: sections.missing },
    })
  }

  if (contact.missing.length > 0) {
    recommendations.push({
      id: nanoid(),
      title: 'Ensure contact details are present and parseable',
      rationale: `Missing: ${contact.missing.join(', ')}. Add them in plain text at the top (avoid headers/footers).`,
      priority: 'high',
      data: { missingContact: contact.missing },
    })
  }

  if (length.bucket !== 'ok') {
    recommendations.push({
      id: nanoid(),
      title: length.bucket === 'low' ? 'Add more substantive detail' : 'Reduce resume length',
      rationale:
        length.bucket === 'low'
          ? 'Your resume text looks short for ATS evaluation. Add measurable outcomes and relevant keywords in Experience.'
          : 'Your resume text looks long, which can dilute keyword signals. Consider tightening bullets and removing redundant sections.',
      priority: 'low',
    })
  }

  if (metrics.tenure_clarity < 45) {
    recommendations.push({
      id: nanoid(),
      title: 'Make date ranges consistent',
      rationale: 'Date ranges (e.g., 2021–2024 or Jan 2021–Present) help ATS infer tenure and continuity. Use a consistent format across roles.',
      priority: 'low',
    })
  }

  return {
    overallScore,
    metrics,
    recommendations,
    debug: {
      jdKeywordCount: jdKeywords.length,
      matchedKeywordCount: matchedKeywords.length,
      missingKeywords,
    },
  }
}

