export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#A8B3CF]">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#273357] border-t-indigo-400" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}

