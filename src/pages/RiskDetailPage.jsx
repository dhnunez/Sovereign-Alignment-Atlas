import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/ui/StatCard'
import RiskBadge from '@/components/ui/RiskBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import { useRisk } from '@/hooks/useRiskData'
import { toPoints, WINDOWS } from '@/lib/riskData'

export default function RiskDetailPage() {
  const { slug } = useParams()
  const { risk, loading } = useRisk(slug)
  const [windowKey, setWindowKey] = useState('1Y')

  if (loading) return <AppLayout title="Risk"><LoadingSpinner /></AppLayout>

  if (!risk) {
    return (
      <AppLayout title="Risk">
        <div className="card text-center py-12">
          <p className="text-gray-400">Risk not found.</p>
          <Link to="/risk" className="text-cyan-400 hover:underline text-sm mt-2 inline-block">← Back to Risk Dashboard</Link>
        </div>
      </AppLayout>
    )
  }

  const activeWindow = WINDOWS.find((w) => w.key === windowKey)
  const points = toPoints(risk.values, activeWindow.days)
  const vsBaseline = risk.attention_score - risk.baseline_5y

  return (
    <AppLayout title={risk.name}>
      <Link to="/risk" className="text-xs text-cyan-400 hover:underline mb-4 inline-block">← Risk Dashboard</Link>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{risk.name}</h1>
            <RiskBadge level={risk.likelihood} />
          </div>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">{risk.description}</p>
          <span className="badge-cyan mt-2">{risk.category}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Attention Score"
          value={risk.attention_score.toFixed(2)}
          change={`${risk.delta_30d >= 0 ? '+' : '−'}${Math.abs(risk.delta_30d).toFixed(2)} (30d)`}
        />
        <StatCard
          label="vs 5Y Average"
          value={`${vsBaseline >= 0 ? '+' : '−'}${Math.abs(vsBaseline).toFixed(2)}`}
        />
        <StatCard label="Likelihood" value={risk.likelihood.charAt(0).toUpperCase() + risk.likelihood.slice(1)} />
      </div>

      {/* History vs baseline */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Attention History</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="inline-block w-3 border-t-2 border-cyan-400 align-middle mr-1" /> attention
              <span className="inline-block w-3 border-t-2 border-dashed border-yellow-500 align-middle ml-3 mr-1" /> 5-year average
            </p>
          </div>
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
        <TimeSeriesChart points={points} baseline={risk.baseline_5y} height={280} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Narrative */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { label: 'Summary', body: risk.narrative.summary },
            { label: 'Recent Developments', body: risk.narrative.developments },
            { label: 'Market Implications', body: risk.narrative.implications },
          ].map((section) => (
            <div key={section.label} className="card">
              <h3 className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-2">{section.label}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Driving sources */}
        <div className="card">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-3">Driving Sources</h3>
          <div className="space-y-3">
            {risk.drivers.map((d, i) => (
              <div key={i} className="border-l-2 border-navy-600 pl-3 py-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`badge ${d.type === 'brokerage' ? 'badge-cyan' : 'bg-navy-700 text-gray-300 border border-navy-600'}`}>
                    {d.type === 'brokerage' ? 'Brokerage' : 'News'}
                  </span>
                  <span
                    className={`text-xs ${d.sentiment === 'negative' ? 'text-red-400' : d.sentiment === 'positive' ? 'text-green-400' : 'text-gray-500'}`}
                  >
                    {d.sentiment}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{d.headline}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{d.source} · {d.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
