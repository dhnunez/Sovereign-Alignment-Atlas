export default function RiskBadge({ level }) {
  const config = {
    low: { color: 'bg-green-400/10 text-green-400 border-green-400/20', dot: 'bg-green-400', label: 'Low' },
    medium: { color: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', dot: 'bg-yellow-400', label: 'Medium' },
    high: { color: 'bg-red-400/10 text-red-400 border-red-400/20', dot: 'bg-red-400', label: 'High' },
    critical: { color: 'bg-red-600/10 text-red-300 border-red-600/20', dot: 'bg-red-600', label: 'Critical' },
  }
  const c = config[level] || config.medium
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
