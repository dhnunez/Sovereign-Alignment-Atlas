import { useState } from 'react'

export default function Header({ title }) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-40 h-14 bg-navy-900/80 backdrop-blur-sm border-b border-navy-700 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-100" style={{ fontFamily: 'var(--font-heading)' }}>
        {title}
      </h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-56"
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
