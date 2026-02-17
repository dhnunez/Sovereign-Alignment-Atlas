import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase'
import { useEntities } from '@/hooks/useEntities'
import { DEAL_TYPES, DEAL_STATUSES, RELATIONSHIP_TYPES, EVENT_TYPES, RISK_LEVELS } from '@/lib/constants'

const formTabs = ['Entity', 'Investment', 'Event', 'Relationship']

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState('Entity')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const { entities, refetch } = useEntities()

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError })
    setTimeout(() => setMessage(null), 3000)
  }

  // Entity form
  const [entityForm, setEntityForm] = useState({
    name: '', full_name: '', type: 'swf', country_code: '', description: '',
    founded_year: '', aum_billions: '', sector: '', government_affiliation: '',
    risk_level: 'medium', strategic_significance: 3, funding_source: '',
    revenue_billions: '', employee_count: '', publicly_traded: false, stock_ticker: '', website: '',
  })

  const handleEntitySubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...entityForm }
    // Clean up numeric fields
    if (data.founded_year) data.founded_year = parseInt(data.founded_year)
    if (data.aum_billions) data.aum_billions = parseFloat(data.aum_billions)
    else delete data.aum_billions
    if (data.revenue_billions) data.revenue_billions = parseFloat(data.revenue_billions)
    else delete data.revenue_billions
    if (data.employee_count) data.employee_count = parseInt(data.employee_count)
    else delete data.employee_count
    // Remove empty strings
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k] })
    data.type = entityForm.type
    data.risk_level = entityForm.risk_level
    data.strategic_significance = entityForm.strategic_significance

    const { error } = await supabase.from('entities').insert(data)
    setSaving(false)
    if (error) showMessage(error.message, true)
    else {
      showMessage('Entity created successfully!')
      setEntityForm({ name: '', full_name: '', type: 'swf', country_code: '', description: '', founded_year: '', aum_billions: '', sector: '', government_affiliation: '', risk_level: 'medium', strategic_significance: 3, funding_source: '', revenue_billions: '', employee_count: '', publicly_traded: false, stock_ticker: '', website: '' })
      refetch()
    }
  }

  // Investment form
  const [investForm, setInvestForm] = useState({
    investor_entity_id: '', target_name: '', target_sector: '', deal_type: 'acquisition',
    status: 'announced', amount_millions: '', stake_percentage: '', announced_date: '',
    description: '', strategic_rationale: '', source_url: '',
  })

  const handleInvestSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...investForm }
    if (data.amount_millions) data.amount_millions = parseFloat(data.amount_millions)
    else delete data.amount_millions
    if (data.stake_percentage) data.stake_percentage = parseFloat(data.stake_percentage)
    else delete data.stake_percentage
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k] })
    data.deal_type = investForm.deal_type
    data.status = investForm.status

    const { error } = await supabase.from('investments').insert(data)
    setSaving(false)
    if (error) showMessage(error.message, true)
    else {
      showMessage('Investment recorded successfully!')
      setInvestForm({ investor_entity_id: '', target_name: '', target_sector: '', deal_type: 'acquisition', status: 'announced', amount_millions: '', stake_percentage: '', announced_date: '', description: '', strategic_rationale: '', source_url: '' })
    }
  }

  // Event form
  const [eventForm, setEventForm] = useState({
    entity_id: '', title: '', description: '', event_type: 'news',
    event_date: '', significance: 3, source_url: '', source_name: '',
  })

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...eventForm }
    data.significance = parseInt(data.significance)
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k] })
    data.event_type = eventForm.event_type

    const { error } = await supabase.from('events').insert(data)
    setSaving(false)
    if (error) showMessage(error.message, true)
    else {
      showMessage('Event recorded successfully!')
      setEventForm({ entity_id: '', title: '', description: '', event_type: 'news', event_date: '', significance: 3, source_url: '', source_name: '' })
    }
  }

  // Relationship form
  const [relForm, setRelForm] = useState({
    entity_a_id: '', entity_b_id: '', relationship_type: 'partner',
    description: '', strength: 3, source_url: '',
  })

  const handleRelSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const data = { ...relForm }
    data.strength = parseInt(data.strength)
    Object.keys(data).forEach(k => { if (data[k] === '') delete data[k] })
    data.relationship_type = relForm.relationship_type

    const { error } = await supabase.from('relationships').insert(data)
    setSaving(false)
    if (error) showMessage(error.message, true)
    else {
      showMessage('Relationship recorded successfully!')
      setRelForm({ entity_a_id: '', entity_b_id: '', relationship_type: 'partner', description: '', strength: 3, source_url: '' })
    }
  }

  return (
    <AppLayout title="Data Entry">
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.isError ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-green-400/10 text-green-400 border border-green-400/20'}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-navy-700">
        {formTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Entity Form */}
        {activeTab === 'Entity' && (
          <form onSubmit={handleEntitySubmit} className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">New Entity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Short Name *</label>
                <input value={entityForm.name} onChange={(e) => setEntityForm({...entityForm, name: e.target.value})} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input value={entityForm.full_name} onChange={(e) => setEntityForm({...entityForm, full_name: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type *</label>
                <select value={entityForm.type} onChange={(e) => setEntityForm({...entityForm, type: e.target.value})} className="input-field w-full">
                  <option value="swf">Sovereign Wealth Fund</option>
                  <option value="national_champion">National Champion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Country Code *</label>
                <input value={entityForm.country_code} onChange={(e) => setEntityForm({...entityForm, country_code: e.target.value})} className="input-field w-full" placeholder="e.g. AE" maxLength={2} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Founded Year</label>
                <input type="number" value={entityForm.founded_year} onChange={(e) => setEntityForm({...entityForm, founded_year: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">AUM (Billions $)</label>
                <input type="number" step="0.1" value={entityForm.aum_billions} onChange={(e) => setEntityForm({...entityForm, aum_billions: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sector</label>
                <input value={entityForm.sector} onChange={(e) => setEntityForm({...entityForm, sector: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Government Affiliation</label>
                <input value={entityForm.government_affiliation} onChange={(e) => setEntityForm({...entityForm, government_affiliation: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Risk Level</label>
                <select value={entityForm.risk_level} onChange={(e) => setEntityForm({...entityForm, risk_level: e.target.value})} className="input-field w-full">
                  {RISK_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Strategic Significance (1-5)</label>
                <input type="number" min="1" max="5" value={entityForm.strategic_significance} onChange={(e) => setEntityForm({...entityForm, strategic_significance: parseInt(e.target.value)})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Website</label>
                <input value={entityForm.website} onChange={(e) => setEntityForm({...entityForm, website: e.target.value})} className="input-field w-full" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Funding Source</label>
                <input value={entityForm.funding_source} onChange={(e) => setEntityForm({...entityForm, funding_source: e.target.value})} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea value={entityForm.description} onChange={(e) => setEntityForm({...entityForm, description: e.target.value})} className="input-field w-full h-20" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Entity'}
            </button>
          </form>
        )}

        {/* Investment Form */}
        {activeTab === 'Investment' && (
          <form onSubmit={handleInvestSubmit} className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">New Investment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Investor Entity *</label>
                <select value={investForm.investor_entity_id} onChange={(e) => setInvestForm({...investForm, investor_entity_id: e.target.value})} className="input-field w-full" required>
                  <option value="">Select entity...</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Name *</label>
                <input value={investForm.target_name} onChange={(e) => setInvestForm({...investForm, target_name: e.target.value})} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Sector</label>
                <input value={investForm.target_sector} onChange={(e) => setInvestForm({...investForm, target_sector: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Deal Type</label>
                <select value={investForm.deal_type} onChange={(e) => setInvestForm({...investForm, deal_type: e.target.value})} className="input-field w-full">
                  {DEAL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select value={investForm.status} onChange={(e) => setInvestForm({...investForm, status: e.target.value})} className="input-field w-full">
                  {DEAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Amount (Millions $)</label>
                <input type="number" step="0.1" value={investForm.amount_millions} onChange={(e) => setInvestForm({...investForm, amount_millions: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Stake %</label>
                <input type="number" step="0.1" value={investForm.stake_percentage} onChange={(e) => setInvestForm({...investForm, stake_percentage: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Announced Date</label>
                <input type="date" value={investForm.announced_date} onChange={(e) => setInvestForm({...investForm, announced_date: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Source URL</label>
                <input value={investForm.source_url} onChange={(e) => setInvestForm({...investForm, source_url: e.target.value})} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea value={investForm.description} onChange={(e) => setInvestForm({...investForm, description: e.target.value})} className="input-field w-full h-20" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Record Investment'}
            </button>
          </form>
        )}

        {/* Event Form */}
        {activeTab === 'Event' && (
          <form onSubmit={handleEventSubmit} className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">New Event</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Related Entity</label>
                <select value={eventForm.entity_id} onChange={(e) => setEventForm({...eventForm, entity_id: e.target.value})} className="input-field w-full">
                  <option value="">Select entity...</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Event Type *</label>
                <select value={eventForm.event_type} onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})} className="input-field w-full">
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Event Date *</label>
                <input type="date" value={eventForm.event_date} onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Significance (1-5)</label>
                <input type="number" min="1" max="5" value={eventForm.significance} onChange={(e) => setEventForm({...eventForm, significance: e.target.value})} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Source Name</label>
                <input value={eventForm.source_name} onChange={(e) => setEventForm({...eventForm, source_name: e.target.value})} className="input-field w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Source URL</label>
                <input value={eventForm.source_url} onChange={(e) => setEventForm({...eventForm, source_url: e.target.value})} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className="input-field w-full h-20" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Record Event'}
            </button>
          </form>
        )}

        {/* Relationship Form */}
        {activeTab === 'Relationship' && (
          <form onSubmit={handleRelSubmit} className="card space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">New Relationship</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Entity A *</label>
                <select value={relForm.entity_a_id} onChange={(e) => setRelForm({...relForm, entity_a_id: e.target.value})} className="input-field w-full" required>
                  <option value="">Select entity...</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Entity B *</label>
                <select value={relForm.entity_b_id} onChange={(e) => setRelForm({...relForm, entity_b_id: e.target.value})} className="input-field w-full" required>
                  <option value="">Select entity...</option>
                  {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relationship Type *</label>
                <select value={relForm.relationship_type} onChange={(e) => setRelForm({...relForm, relationship_type: e.target.value})} className="input-field w-full">
                  {RELATIONSHIP_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Strength (1-5)</label>
                <input type="number" min="1" max="5" value={relForm.strength} onChange={(e) => setRelForm({...relForm, strength: e.target.value})} className="input-field w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Source URL</label>
                <input value={relForm.source_url} onChange={(e) => setRelForm({...relForm, source_url: e.target.value})} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea value={relForm.description} onChange={(e) => setRelForm({...relForm, description: e.target.value})} className="input-field w-full h-20" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Create Relationship'}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  )
}
