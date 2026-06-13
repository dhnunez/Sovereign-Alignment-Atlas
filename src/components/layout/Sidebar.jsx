import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/risk', label: 'Risk Dashboard', icon: 'activity' },
  { path: '/swf', label: 'Sovereign Wealth Funds', icon: 'landmark' },
  { path: '/champions', label: 'National Champions', icon: 'trophy' },
  { path: '/network', label: 'Network Graph', icon: 'network' },
  { path: '/map', label: 'World Map', icon: 'globe' },
  { path: '/events', label: 'Events', icon: 'calendar' },
  { path: '/alerts', label: 'Alerts', icon: 'bell' },
  { path: '/data-entry', label: 'Data Entry', icon: 'edit' },
]

function NavIcon({ name, size = 18 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'grid': return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    case 'activity': return <svg {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    case 'landmark': return <svg {...props}><rect x="3" y="10" width="4" height="10"/><rect x="10" y="6" width="4" height="14"/><rect x="17" y="10" width="4" height="10"/><path d="M2 20h20"/><path d="M12 2L2 8h20L12 2z"/></svg>
    case 'trophy': return <svg {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C5.3 4 6 4.7 6 5.5V9"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C18.7 4 18 4.7 18 5.5V9"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    case 'network': return <svg {...props}><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 7l3 9M17 7l-3 9"/><path d="M7 6h10"/></svg>
    case 'globe': return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    case 'calendar': return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    case 'bell': return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'edit': return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    case 'logout': return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'chevron': return <svg {...props}><polyline points="9 18 15 12 9 6"/></svg>
    default: return null
  }
}

export default function Sidebar({ onSignOut }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-navy-900 border-r border-navy-700 flex flex-col z-50 transition-all duration-200 ${expanded ? 'w-60' : 'w-16'}`}>
      {/* Header */}
      <div className="flex items-center h-14 px-4 border-b border-navy-700">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan-400 text-xs font-bold font-mono">S</span>
          </div>
          {expanded && (
            <span className="text-sm font-semibold text-gray-200 truncate" style={{ fontFamily: 'var(--font-heading)' }}>
              Sovereign Atlas
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-navy-800 border-l-2 border-transparent'
              }`
            }
          >
            <NavIcon name={item.icon} />
            {expanded && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-navy-700 p-3">
        <button
          onClick={onSignOut}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-colors ${!expanded ? 'justify-center' : ''}`}
        >
          <NavIcon name="logout" />
          {expanded && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm text-gray-500 hover:text-gray-300 transition-colors mt-1 ${!expanded ? 'justify-center' : ''}`}
        >
          <div className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <NavIcon name="chevron" />
          </div>
          {expanded && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
