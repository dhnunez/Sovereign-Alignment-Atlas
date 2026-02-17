import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import SignificanceBar from '@/components/ui/SignificanceBar'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { EVENT_TYPES } from '@/lib/constants'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function fetch() {
      let query = supabase
        .from('events')
        .select('*, entities(id, name, type, country_code)')
        .order('event_date', { ascending: false })
        .limit(100)

      if (typeFilter !== 'all') {
        query = query.eq('event_type', typeFilter)
      }

      const { data } = await query
      setEvents(data || [])
      setLoading(false)
    }
    fetch()
  }, [typeFilter])

  if (loading) return <AppLayout title="Events Timeline"><LoadingSpinner /></AppLayout>

  const eventTypeColors = {
    news: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    policy: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    deal: 'bg-green-400/10 text-green-400 border-green-400/20',
    leadership_change: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    sanction: 'bg-red-400/10 text-red-400 border-red-400/20',
    regulation: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    earnings: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  }

  return (
    <AppLayout title="Events Timeline">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            typeFilter === 'all' ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30' : 'bg-navy-800 text-gray-400 border border-navy-700'
          }`}
        >
          All Types
        </button>
        {EVENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
              typeFilter === type ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30' : 'bg-navy-800 text-gray-400 border border-navy-700'
            }`}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState title="No Events" message="No events match the current filters." />
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-navy-700" />
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-3 top-3 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-navy-950" />
                <div className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${eventTypeColors[event.event_type] || 'bg-navy-700 text-gray-400'}`}>
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{event.event_date}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-200">{event.title}</h3>
                      {event.description && <p className="text-xs text-gray-400 mt-1">{event.description}</p>}
                      {event.entities && (
                        <Link
                          to={`/${event.entities.type === 'swf' ? 'swf' : 'champions'}/${event.entities.id}`}
                          className="text-xs text-cyan-400 hover:underline mt-1 inline-block"
                        >
                          {event.entities.name}
                        </Link>
                      )}
                    </div>
                    {event.significance && <SignificanceBar value={event.significance} />}
                  </div>
                  {event.source_url && (
                    <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cyan-400 mt-2 inline-block">
                      View Source →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
