import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { useEntities } from '@/hooks/useEntities'
import { Link } from 'react-router-dom'

export default function ChampionsListPage() {
  const { entities, loading } = useEntities('national_champion')

  if (loading) return <AppLayout title="National Champions"><LoadingSpinner /></AppLayout>

  if (entities.length === 0) {
    return (
      <AppLayout title="National Champions">
        <EmptyState
          title="No National Champions Yet"
          message="National champion entities will be added here. Use the Data Entry form to add state-linked firms."
          action={<Link to="/data-entry" className="btn-primary">Add Entity</Link>}
        />
      </AppLayout>
    )
  }

  return (
    <AppLayout title="National Champions">
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-700">
              <th className="table-header">Company</th>
              <th className="table-header">Country</th>
              <th className="table-header">Sector</th>
              <th className="table-header text-right">Revenue ($B)</th>
              <th className="table-header text-right">Employees</th>
              <th className="table-header">Risk</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id} className="border-b border-navy-800 hover:bg-navy-800/50 transition-colors">
                <td className="table-cell">
                  <Link to={`/champions/${entity.id}`} className="font-medium text-gray-200 hover:text-red-400 transition-colors">
                    {entity.name}
                  </Link>
                </td>
                <td className="table-cell">
                  <span className="flex items-center gap-1.5">
                    <span>{entity.countries?.flag_emoji}</span>
                    <span className="text-xs">{entity.countries?.name}</span>
                  </span>
                </td>
                <td className="table-cell text-xs">{entity.sector || '—'}</td>
                <td className="table-cell text-right font-mono">{entity.revenue_billions || '—'}</td>
                <td className="table-cell text-right font-mono">{entity.employee_count?.toLocaleString() || '—'}</td>
                <td className="table-cell"><span className="badge-red">{entity.risk_level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
