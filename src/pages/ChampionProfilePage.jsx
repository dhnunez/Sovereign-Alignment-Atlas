import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import RiskBadge from '@/components/ui/RiskBadge'
import SignificanceBar from '@/components/ui/SignificanceBar'
import { useEntity } from '@/hooks/useEntities'

const tabs = ['Overview', 'Investments', 'Relationships', 'Events']

export default function ChampionProfilePage() {
  const { id } = useParams()
  const { entity, investments, events, relationships, loading } = useEntity(id)
  const [activeTab, setActiveTab] = useState('Overview')

  if (loading) return <AppLayout title="Company Profile"><LoadingSpinner /></AppLayout>
  if (!entity) return <AppLayout title="Not Found"><p className="text-gray-400">Entity not found.</p></AppLayout>

  return (
    <AppLayout title={entity.name}>
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
            {entity.publicly_traded && entity.stock_ticker && (
              <p className="text-lg font-mono text-red-400">{entity.stock_ticker}</p>
            )}
            {entity.revenue_billions && (
              <>
                <p className="text-2xl font-mono text-champion-red">${entity.revenue_billions}B</p>
                <p className="text-xs text-gray-500">Revenue</p>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-navy-700">
          <div>
            <p className="text-xs text-gray-500">Sector</p>
            <p className="text-sm text-gray-300">{entity.sector || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Employees</p>
            <p className="text-sm text-gray-300">{entity.employee_count?.toLocaleString() || '—'}</p>
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
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-navy-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-champion-red text-champion-red' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Summary</h3>
          <p className="text-sm text-gray-400">{entity.description || 'No description available.'}</p>
        </div>
      )}

      {activeTab === 'Investments' && (
        <div className="card">
          {investments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No investments recorded</p>
          ) : (
            <div className="space-y-2">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-navy-800 last:border-0">
                  <div>
                    <p className="text-sm text-gray-200">{inv.target_name}</p>
                    <p className="text-xs text-gray-500">{inv.deal_type?.replace(/_/g, ' ')} &middot; {inv.announced_date}</p>
                  </div>
                  {inv.amount_millions && <span className="font-mono text-sm text-champion-red">${inv.amount_millions}M</span>}
                </div>
              ))}
            </div>
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
                <div key={rel.id} className="card">
                  <Link to={`/${other?.type === 'swf' ? 'swf' : 'champions'}/${other?.id}`} className="text-sm font-medium text-champion-red hover:underline">
                    {other?.name}
                  </Link>
                  <p className="text-xs text-gray-400 capitalize">{rel.relationship_type?.replace(/_/g, ' ')}</p>
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
              <div key={ev.id} className="card">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-red text-xs capitalize">{ev.event_type}</span>
                  <span className="text-xs text-gray-500">{ev.event_date}</span>
                </div>
                <p className="text-sm text-gray-200">{ev.title}</p>
                {ev.description && <p className="text-xs text-gray-400 mt-1">{ev.description}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  )
}
