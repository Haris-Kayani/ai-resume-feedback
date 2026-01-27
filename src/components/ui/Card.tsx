import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl bg-[#111827] border border-white/10', className)} {...props} />
}

