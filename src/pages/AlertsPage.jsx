import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { useAuth } from '@/lib/AuthContext'
import { useAlerts, useNotifications } from '@/hooks/useAlerts'
import { useEntities } from '@/hooks/useEntities'
import { supabase } from '@/lib/supabase'
import { ALERT_TYPES } from '@/lib/constants'

export default function AlertsPage() {
  const { user } = useAuth()
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useAlerts(user?.id)
  const { notifications, unreadCount, loading: notifLoading, markAsRead } = useNotifications(user?.id)
  const { entities } = useEntities()
  const [showCreate, setShowCreate] = useState(false)
  const [newAlert, setNewAlert] = useState({ entity_id: '', alert_type: 'new_investment' })

  const handleCreateAlert = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('alerts').insert({
      user_id: user.id,
      entity_id: newAlert.entity_id || null,
      alert_type: newAlert.alert_type,
      is_active: true,
    })
    if (!error) {
      setShowCreate(false)
      setNewAlert({ entity_id: '', alert_type: 'new_investment' })
      refetchAlerts()
    }
  }

  const handleDeleteAlert = async (alertId) => {
    await supabase.from('alerts').delete().eq('id', alertId)
    refetchAlerts()
  }

  if (alertsLoading) return <AppLayout title="Alerts"><LoadingSpinner /></AppLayout>

  return (
    <AppLayout title="Alerts & Notifications">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Config */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Active Alerts</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-xs">
              {showCreate ? 'Cancel' : '+ New Alert'}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateAlert} className="card mb-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Alert Type</label>
                <select
                  value={newAlert.alert_type}
                  onChange={(e) => setNewAlert({ ...newAlert, alert_type: e.target.value })}
                  className="input-field w-full"
                >
                  {ALERT_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Entity (optional)</label>
                <select
                  value={newAlert.entity_id}
                  onChange={(e) => setNewAlert({ ...newAlert, entity_id: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">All entities</option>
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Create Alert</button>
            </form>
          )}

          {alerts.length === 0 ? (
            <EmptyState title="No Alerts" message="Create alerts to get notified about entity activity." />
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200 capitalize">{alert.alert_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{alert.entities?.name || 'All entities'}</p>
                  </div>
                  <button onClick={() => handleDeleteAlert(alert.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-cyan-400/10 text-cyan-400 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h2>
          </div>

          {notifLoading ? (
            <LoadingSpinner size="sm" />
          ) : notifications.length === 0 ? (
            <EmptyState title="No Notifications" message="Notifications from your alerts will appear here." />
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`card cursor-pointer transition-colors ${!notif.is_read ? 'border-cyan-400/20' : ''}`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-2">
                    {!notif.is_read && <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-200">{notif.title}</p>
                      {notif.message && <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>}
                      <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
