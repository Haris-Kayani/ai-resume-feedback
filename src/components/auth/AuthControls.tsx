import { Eye, EyeOff } from 'lucide-react'
import { useState, type HTMLAttributes } from 'react'

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={
        className ||
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white'
      }
      aria-hidden="true"
    />
  )
}

export function AuthTextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-600">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/10"
      />
    </div>
  )
}

export function AuthPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  helper,
}: {
  id: string
  label: string
  value: string
  onChange: (next: string) => void
  autoComplete?: string
  helper?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-zinc-600">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
          aria-controls={id}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          <span className="whitespace-nowrap">{visible ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/10"
      />
      {helper ? <div className="mt-2 text-xs text-zinc-500">{helper}</div> : null}
    </div>
  )
}

export function AuthPrimaryButton({
  label,
  onClick,
  disabled,
  loading,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  loading: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 w-full rounded-full bg-zinc-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-zinc-900/15"
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? <InlineSpinner /> : null}
        {label}
      </span>
    </button>
  )
}
