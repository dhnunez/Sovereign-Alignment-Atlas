import { Link } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useEntities, useRecentActivity } from '@/hooks/useEntities'

export default function DashboardPage() {
  const { entities, loading: entitiesLoading } = useEntities()
  const { activities, loading: activitiesLoading } = useRecentActivity(10)

  const swfs = entities.filter((e) => e.type === 'swf')
  const champions = entities.filter((e) => e.type === 'national_champion')
  const totalAum = swfs.reduce((sum, e) => sum + (e.aum_billions || 0), 0)
  const countriesCount = new Set(entities.map((e) => e.country_code)).size

  if (entitiesLoading) {
    return <AppLayout title="Dashboard"><LoadingSpinner /></AppLayout>
  }

  return (
    <AppLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Sovereign Wealth Funds" value={swfs.length} />
        <StatCard label="National Champions" value={champions.length} />
        <StatCard label="Total AUM" value={`$${totalAum.toLocaleString()}B`} />
        <StatCard label="Countries Tracked" value={countriesCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top SWFs by AUM */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Top SWFs by AUM</h2>
              <Link to="/swf" className="text-xs text-cyan-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
              {swfs.slice(0, 8).map((entity) => (
                <Link
                  key={entity.id}
                  to={`/swf/${entity.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-navy-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{entity.countries?.flag_emoji || '🏳️'}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-200">{entity.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{entity.countries?.name}</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-cyan-400">${entity.aum_billions}B</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Recent Activity</h2>
            <Link to="/events" className="text-xs text-cyan-400 hover:underline">View All</Link>
          </div>
          {activitiesLoading ? (
            <LoadingSpinner size="sm" />
          ) : activities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activities.map((event) => (
                <div key={event.id} className="border-l-2 border-navy-600 pl-3 py-1">
                  <p className="text-sm text-gray-300">{event.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-cyan-400">{event.entities?.name}</span>
                    <span className="text-xs text-gray-500">{event.event_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Region Overview */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-4">By Region</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Gulf States', codes: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'], color: 'cyan' },
            { name: 'East Asia', codes: ['HK', 'KR', 'JP', 'CN'], color: 'cyan' },
            { name: 'Southeast Asia', codes: ['SG', 'MY', 'BN', 'PH', 'VN', 'ID'], color: 'cyan' },
          ].map((region) => {
            const regionEntities = entities.filter((e) => region.codes.includes(e.country_code))
            const regionAum = regionEntities.reduce((sum, e) => sum + (e.aum_billions || 0), 0)
            return (
              <div key={region.name} className="card">
                <h3 className="text-sm font-medium text-gray-300 mb-2">{region.name}</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-mono text-white">{regionEntities.length}</p>
                    <p className="text-xs text-gray-500">entities</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono text-cyan-400">${regionAum.toLocaleString()}B</p>
                    <p className="text-xs text-gray-500">total AUM</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
