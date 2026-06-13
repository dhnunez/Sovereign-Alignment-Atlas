export const ENTITY_TYPES = {
  SWF: 'swf',
  NATIONAL_CHAMPION: 'national_champion',
}

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical']

export const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
  critical: '#dc2626',
}

export const DEAL_TYPES = [
  'acquisition',
  'minority_stake',
  'joint_venture',
  'debt_financing',
  'ipo_investment',
  'real_estate',
  'infrastructure',
  'venture_capital',
  'merger',
  'divestiture',
]

export const DEAL_STATUSES = ['announced', 'pending', 'completed', 'cancelled', 'rumored']

export const RELATIONSHIP_TYPES = [
  'subsidiary',
  'investor',
  'partner',
  'board_overlap',
  'government_link',
  'supply_chain',
  'joint_venture',
  'competitor',
]

export const EVENT_TYPES = [
  'news',
  'policy',
  'deal',
  'leadership_change',
  'sanction',
  'regulation',
  'earnings',
]

export const ALERT_TYPES = [
  'new_investment',
  'leadership_change',
  'risk_change',
  'new_relationship',
  'news_mention',
  'regulatory_action',
]

export const REGIONS = {
  gulf: { label: 'Gulf States', countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'] },
  east_asia: { label: 'East Asia', countries: ['HK', 'KR', 'JP', 'CN'] },
  southeast_asia: { label: 'Southeast Asia', countries: ['SG', 'MY', 'BN', 'PH', 'VN', 'ID'] },
}

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'grid' },
  { path: '/risk', label: 'Risk Dashboard', icon: 'activity' },
  { path: '/swf', label: 'Sovereign Wealth Funds', icon: 'landmark' },
  { path: '/champions', label: 'National Champions', icon: 'trophy' },
  { path: '/network', label: 'Network Graph', icon: 'share2' },
  { path: '/map', label: 'World Map', icon: 'globe' },
  { path: '/events', label: 'Events', icon: 'calendar' },
  { path: '/alerts', label: 'Alerts', icon: 'bell' },
  { path: '/data-entry', label: 'Data Entry', icon: 'edit' },
]
