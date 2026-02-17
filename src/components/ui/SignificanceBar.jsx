export default function SignificanceBar({ value = 0, maxValue = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxValue }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-sm ${i < value ? 'bg-cyan-400' : 'bg-navy-700'}`}
        />
      ))}
      <span className="ml-1 text-xs text-gray-500 font-mono">{value}/{maxValue}</span>
    </div>
  )
}
