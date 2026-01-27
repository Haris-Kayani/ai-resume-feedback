import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

export default function Button({ className, variant = 'primary', size = 'md', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed'
  const v =
    variant === 'primary'
      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-500'
        : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
  const s = size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-4 text-sm'
  return <button className={cn(base, v, s, className)} {...props} />
}
