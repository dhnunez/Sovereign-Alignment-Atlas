export default function EmptyState({ title = 'No data yet', message = 'Data will appear here once available.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a3f78" strokeWidth="1.5" className="mb-4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h4" strokeLinecap="round" />
      </svg>
      <h3 className="text-gray-400 font-medium mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
