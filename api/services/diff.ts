import { createTwoFilesPatch } from 'diff'

export function createUnifiedDiff(params: {
  baseText: string
  compareText: string
  baseLabel?: string
  compareLabel?: string
}): string {
  const baseLabel = params.baseLabel || 'base'
  const compareLabel = params.compareLabel || 'compare'
  return createTwoFilesPatch(
    baseLabel,
    compareLabel,
    params.baseText || '',
    params.compareText || '',
    undefined,
    undefined,
    { context: 3 },
  )
}

