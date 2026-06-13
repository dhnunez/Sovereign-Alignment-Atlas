import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/ui/StatCard'
import RiskBadge from '@/components/ui/RiskBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import Sparkline from '@/components/charts/Sparkline'
import { useRiskOverview } from '@/hooks/useRiskData'
import { toPoints, WINDOWS } from '@/lib/riskData'

const LIKELIHOOD_ORDER = { high: 3, medium: 2, low: 1 }

function Delta({ value, digits = 2 }) {
  const rising = value >= 0
  const sign = rising ? '+' : '−'
  return (
    <span className={`font-mono text-xs ${rising ? 'text-red-400' : 'text-green-400'}`}>
      {rising ? '▲' : '▼'} {sign}
      {Math.abs(value).toFixed(digits)}
    </span>
  )
}

export default function RiskDashboardPage() {
  const { overview, loading } = useRiskOverview()
  const [windowKey, setWindowKey] = useState('1Y')
  const [sort, setSort] = useState({ col: 'attention_score', dir: 'desc' })

  if (loading || !overview) {
    return <AppLayout title="Risk Dashboard"><LoadingSpinner /></AppLayout>
  }

  const activeWindow = WINDOWS.find((w) => w.key === windowKey)
  const points = toPoints(overview.values, activeWindow.days)
  const windowAnnotations = activeWindow.days == null
    ? overview.annotations
    : overview.annotations.filter((a) => a.date >= points[0].date)

  function toggleSort(col) {
    setSort((s) => (s.col === col ? { col, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: 'desc' }))
  }

  const sortedRisks = [...overview.risks].sort((a, b) => {
    const dir = sort.dir === 'desc' ? -1 : 1
    let av, bv
    if (sort.col === 'likelihood') {
      av = LIKELIHOOD_ORDER[a.likelihood]
      bv = LIKELIHOOD_ORDER[b.likelihood]
    } else {
      av = a[sort.col]
      bv = b[sort.col]
    }
    return av < bv ? dir : av > bv ? -dir : 0
  })

  const sortArrow = (col) => (sort.col === col ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '')

  return (
    <AppLayout title="Risk Dashboard">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-400 max-w-2xl">
          Market attention to each geopolitical risk, sentiment-adjusted and normalized against its own 5-year
          history. Likelihood reflects an expert assessment, updated through editorial review.
        </p>
        <span className="text-xs text-gray-500 font-mono">As of {overview.as_of}</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Global Risk Indicator"
          value={overview.score.toFixed(2)}
          change={`${overview.delta_30d >= 0 ? '+' : '−'}${Math.abs(overview.delta_30d).toFixed(2)} (30d)`}
        />
        <StatCard label="High-Likelihood Risks" value={overview.high_likelihood_count} />
        <StatCard
          label="Biggest 30d Mover"
          value={overview.biggest_mover.name.split(' ').slice(0, 2).join(' ')}
          change={`${overview.biggest_mover.delta_30d >= 0 ? '+' : '−'}${Math.abs(overview.biggest_mover.delta_30d).toFixed(2)}`}
        />
        <StatCard label="Risks Tracked" value={overview.risks.length} />
      </div>

      {/* Global indicator chart */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Global Risk Indicator</h2>
          <div className="flex gap-1">
            {WINDOWS.map((w) => (
              <button
                key={w.key}
                onClick={() => setWindowKey(w.key)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  windowKey === w.key
                    ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/30'
                    : 'text-gray-400 border border-transparent hover:text-gray-200 hover:bg-navy-800'
                }`}
              >
                {w.key}
              </button>
            ))}
          </div>
        </div>
        <TimeSeriesChart points={points} annotations={windowAnnotations} height={280} />
        {windowAnnotations.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-navy-700 pt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">What moved the line</p>
            {windowAnnotations.map((a) => (
              <div key={a.label} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-champion-red flex-shrink-0" />
                <span className="text-gray-500 font-mono">{a.date}</span>
                <span className="text-gray-300">{a.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top risks table */}
      <div className="card">
        <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Top Risks</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="table-header">Risk</th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort('likelihood')}>
                  Likelihood{sortArrow('likelihood')}
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort('attention_score')}>
                  Attention{sortArrow('attention_score')}
                </th>
                <th className="table-header cursor-pointer select-none" onClick={() => toggleSort('delta_30d')}>
                  30d Δ{sortArrow('delta_30d')}
                </th>
                <th className="table-header">90d Trend</th>
              </tr>
            </thead>
            <tbody>
              {sortedRisks.map((r) => (
                <tr key={r.slug} className="border-b border-navy-800 hover:bg-navy-800/60 transition-colors">
                  <td className="table-cell">
                    <Link to={`/risk/${r.slug}`} className="group">
                      <span className="text-gray-200 group-hover:text-cyan-400 font-medium">{r.name}</span>
                      <span className="block text-xs text-gray-500">{r.category}</span>
                    </Link>
                  </td>
                  <td className="table-cell"><RiskBadge level={r.likelihood} /></td>
                  <td className="table-cell font-mono text-cyan-400">{r.attention_score.toFixed(2)}</td>
                  <td className="table-cell"><Delta value={r.delta_30d} /></td>
                  <td className="table-cell"><Sparkline values={r.spark} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
