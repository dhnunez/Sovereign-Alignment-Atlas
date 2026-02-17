export default function StatCard({ label, value, change, icon }) {
  const isPositive = change && !change.startsWith('-')
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
          <p className="text-2xl font-semibold text-white mt-1 font-mono">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
    </div>
  )
}
