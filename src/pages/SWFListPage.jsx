import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import RiskBadge from '@/components/ui/RiskBadge'
import SignificanceBar from '@/components/ui/SignificanceBar'
import { useEntities } from '@/hooks/useEntities'

export default function SWFListPage() {
  const { entities, loading } = useEntities('swf')
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')

  const regions = {
    all: { label: 'All Regions', codes: null },
    gulf: { label: 'Gulf States', codes: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'] },
    east_asia: { label: 'East Asia', codes: ['HK', 'KR', 'JP', 'CN'] },
    southeast_asia: { label: 'Southeast Asia', codes: ['SG', 'MY', 'BN', 'PH', 'VN', 'ID'] },
  }

  const filtered = entities.filter((e) => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.full_name?.toLowerCase().includes(search.toLowerCase())
    const matchesRegion = regionFilter === 'all' || regions[regionFilter]?.codes?.includes(e.country_code)
    return matchesSearch && matchesRegion
  })

  if (loading) return <AppLayout title="Sovereign Wealth Funds"><LoadingSpinner /></AppLayout>

  return (
    <AppLayout title="Sovereign Wealth Funds">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search funds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-64"
        />
        <div className="flex gap-1">
          {Object.entries(regions).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setRegionFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                regionFilter === key
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30'
                  : 'bg-navy-800 text-gray-400 border border-navy-700 hover:text-gray-300'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} funds</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="table-header">Fund</th>
                <th className="table-header">Country</th>
                <th className="table-header text-right">AUM ($B)</th>
                <th className="table-header">Sector</th>
                <th className="table-header">Risk</th>
                <th className="table-header">Significance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity) => (
                <tr key={entity.id} className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors">
                  <td className="table-cell">
                    <Link to={`/swf/${entity.id}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                      <span className="font-medium text-gray-200">{entity.name}</span>
                      {entity.full_name && <span className="text-xs text-gray-500 hidden lg:inline">({entity.full_name})</span>}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5">
                      <span>{entity.countries?.flag_emoji}</span>
                      <span className="text-xs">{entity.countries?.name}</span>
                    </span>
                  </td>
                  <td className="table-cell text-right font-mono text-cyan-400">{entity.aum_billions || '—'}</td>
                  <td className="table-cell text-xs">{entity.sector || '—'}</td>
                  <td className="table-cell"><RiskBadge level={entity.risk_level} /></td>
                  <td className="table-cell"><SignificanceBar value={entity.strategic_significance} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
