import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import RiskBadge from '@/components/ui/RiskBadge'
import SignificanceBar from '@/components/ui/SignificanceBar'
import { useEntity } from '@/hooks/useEntities'

const tabs = ['Overview', 'Investments', 'Relationships', 'Events']

export default function SWFProfilePage() {
  const { id } = useParams()
  const { entity, investments, events, relationships, loading } = useEntity(id)
  const [activeTab, setActiveTab] = useState('Overview')

  if (loading) return <AppLayout title="SWF Profile"><LoadingSpinner /></AppLayout>
  if (!entity) return <AppLayout title="Not Found"><p className="text-gray-400">Entity not found.</p></AppLayout>

  return (
    <AppLayout title={entity.name}>
      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{entity.countries?.flag_emoji}</span>
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{entity.full_name || entity.name}</h2>
                <p className="text-sm text-gray-400">{entity.countries?.name} &middot; Founded {entity.founded_year}</p>
              </div>
            </div>
            {entity.description && <p className="text-sm text-gray-400 mt-2 max-w-2xl">{entity.description}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono text-cyan-400">${entity.aum_billions}B</p>
            <p className="text-xs text-gray-500">Assets Under Management</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-navy-700">
          <div>
            <p className="text-xs text-gray-500">Sector</p>
            <p className="text-sm text-gray-300">{entity.sector || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Government Affiliation</p>
            <p className="text-sm text-gray-300">{entity.government_affiliation || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Risk Level</p>
            <RiskBadge level={entity.risk_level} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Strategic Significance</p>
            <SignificanceBar value={entity.strategic_significance} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Funding Source</p>
            <p className="text-sm text-gray-300">{entity.funding_source || '—'}</p>
          </div>
          {entity.website && (
            <div>
              <p className="text-xs text-gray-500">Website</p>
              <a href={entity.website} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline">{entity.website}</a>
            </div>
          )}
        </div>

        {entity.tags?.length > 0 && (
          <div className="flex gap-2 mt-3">
            {entity.tags.map((tag) => (
              <span key={tag} className="badge-cyan">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-navy-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
            {tab === 'Investments' && <span className="ml-1.5 text-xs text-gray-500">({investments.length})</span>}
            {tab === 'Relationships' && <span className="ml-1.5 text-xs text-gray-500">({relationships.length})</span>}
            {tab === 'Events' && <span className="ml-1.5 text-xs text-gray-500">({events.length})</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Key Metrics</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-400">AUM</dt>
                <dd className="text-sm font-mono text-cyan-400">${entity.aum_billions}B</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-400">Founded</dt>
                <dd className="text-sm text-gray-300">{entity.founded_year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-400">Active Investments</dt>
                <dd className="text-sm text-gray-300">{investments.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-400">Relationships</dt>
                <dd className="text-sm text-gray-300">{relationships.length}</dd>
              </div>
            </dl>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Recent Events</h3>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500">No events recorded</p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="border-l-2 border-navy-600 pl-3 py-1">
                    <p className="text-sm text-gray-300">{ev.title}</p>
                    <p className="text-xs text-gray-500">{ev.event_date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Investments' && (
        <div className="card overflow-hidden">
          {investments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No investments recorded</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-700">
                  <th className="table-header">Target</th>
                  <th className="table-header">Type</th>
                  <th className="table-header text-right">Amount ($M)</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-navy-800">
                    <td className="table-cell font-medium text-gray-200">{inv.target_name}</td>
                    <td className="table-cell text-xs">{inv.deal_type?.replace(/_/g, ' ')}</td>
                    <td className="table-cell text-right font-mono">{inv.amount_millions || '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${inv.status === 'completed' ? 'badge-cyan' : 'bg-navy-700 text-gray-400'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{inv.announced_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'Relationships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relationships.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-2 text-center py-8">No relationships recorded</p>
          ) : (
            relationships.map((rel) => {
              const other = rel.entity_a_id === id ? rel.entity_b : rel.entity_a
              return (
                <div key={rel.id} className="card-hover">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/swf/${other?.id}`} className="text-sm font-medium text-cyan-400 hover:underline">
                        {other?.name || 'Unknown'}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{rel.relationship_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <SignificanceBar value={rel.strength} />
                  </div>
                  {rel.description && <p className="text-xs text-gray-500 mt-2">{rel.description}</p>}
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'Events' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No events recorded</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="card flex items-start gap-4">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-xs text-gray-500">{ev.event_date}</p>
                </div>
                <div className="border-l-2 border-navy-600 pl-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge-cyan text-xs capitalize">{ev.event_type}</span>
                    {ev.significance && <SignificanceBar value={ev.significance} />}
                  </div>
                  <p className="text-sm text-gray-200 mt-1">{ev.title}</p>
                  {ev.description && <p className="text-xs text-gray-400 mt-1">{ev.description}</p>}
                  {ev.source_url && (
                    <a href={ev.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mt-1 inline-block">Source</a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  )
}
