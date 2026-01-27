import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg bg-[#0d1321] border border-white/10 px-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40',
        className,
      )}
      {...props}
    />
  )
}

