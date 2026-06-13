// ============================================================================
// Geopolitical Risk demo data — prototype for the dashboard overhaul.
//
// Models the structure of a BGRI-style dashboard: a set of tracked risks,
// each with an editorial likelihood rating, a daily market-attention score
// series (sentiment-adjusted, normalized against its own 5-year history),
// versioned narrative sections, and the source documents driving the score.
//
// All series are generated deterministically from a seed so the prototype
// renders identically on every load. In production these arrays would come
// from the scoring pipeline + analyst CMS described in the proposal.
// ============================================================================

const TODAY = new Date('2026-06-13T00:00:00Z')
const DAYS = 5 * 365 // 5 years of daily history

// Deterministic PRNG (mulberry32) so the demo is stable across reloads.
function makeRng(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function isoDaysAgo(n) {
  const d = new Date(TODAY)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

// Generate a mean-reverting random walk with occasional shocks. The result is
// a normalized attention score (roughly standard deviations from its own mean,
// like the BGRI), clamped to a sensible range.
function generateSeries({ seed, base, drift, volatility, shocks }) {
  const rng = makeRng(seed)
  const values = new Array(DAYS)
  let v = base
  for (let i = 0; i < DAYS; i++) {
    const meanRevert = (base - v) * 0.015
    const noise = (rng() - 0.5) * volatility
    const trend = (drift * i) / DAYS
    v = v + meanRevert + noise
    let shockVal = 0
    for (const s of shocks) {
      const dayIndex = DAYS - 1 - s.daysAgo
      const dist = i - dayIndex
      if (dist >= 0 && dist < s.decay) {
        shockVal += s.magnitude * (1 - dist / s.decay)
      }
    }
    values[i] = Math.max(-2.5, Math.min(3.5, v + trend + shockVal))
  }
  return values
}

// --------------------------------------------------------------------------
// Tracked risks — top-10 BGRI-style set, with editorial fields + series spec.
// --------------------------------------------------------------------------
const RISK_DEFS = [
  {
    slug: 'global-trade-protectionism',
    name: 'Global trade protectionism',
    category: 'Economic',
    likelihood: 'high',
    description:
      'Escalating tariffs, export controls, and retaliatory trade measures fragmenting global commerce and reshaping supply chains.',
    narrative: {
      summary:
        'Market attention remains elevated as major economies expand tariff regimes and tighten export-control regimes on strategic goods. Attention sits well above its 5-year average.',
      developments:
        'New tariff packages on industrial and agricultural goods were announced this quarter, with several trading partners signalling retaliation. Negotiations over critical-mineral access stalled.',
      implications:
        'We see continued pressure on globally exposed cyclicals and import-dependent manufacturers. Supply-chain reconfiguration favours domestic and friend-shored producers; watch input-cost inflation.',
    },
    series: { seed: 11, base: 1.6, drift: 0.9, volatility: 0.22, shocks: [{ daysAgo: 40, magnitude: 0.9, decay: 60 }, { daysAgo: 210, magnitude: 0.6, decay: 90 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'New tariff package widens to industrial machinery', date: isoDaysAgo(6), sentiment: 'negative' },
      { type: 'brokerage', source: 'Sell-side research', headline: 'Re-rating import-exposed cyclicals on trade risk', date: isoDaysAgo(12), sentiment: 'negative' },
      { type: 'news', source: 'Financial press', headline: 'Trading partners weigh retaliatory measures', date: isoDaysAgo(19), sentiment: 'negative' },
    ],
  },
  {
    slug: 'middle-east-regional-war',
    name: 'Middle East regional war',
    category: 'Conflict',
    likelihood: 'high',
    description:
      'Risk of a broader regional conflict drawing in multiple state and non-state actors, with implications for energy supply and shipping.',
    narrative: {
      summary:
        'Attention spiked on renewed escalation and disruption to regional shipping lanes, then partially retraced as a fragile pause held.',
      developments:
        'Cross-border strikes and maritime incidents drove a sharp attention spike. A tentative de-escalation framework is under discussion but remains fragile.',
      implications:
        'Energy and freight-rate sensitivity is high. We favour positioning resilient to oil-price spikes and watch tanker-route insurance costs as a real-time gauge.',
    },
    series: { seed: 22, base: 1.2, drift: 0.5, volatility: 0.3, shocks: [{ daysAgo: 25, magnitude: 1.6, decay: 45 }, { daysAgo: 150, magnitude: 1.1, decay: 70 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'Shipping disruption in key strait lifts freight rates', date: isoDaysAgo(4), sentiment: 'negative' },
      { type: 'brokerage', source: 'Sell-side research', headline: 'Energy desk raises near-term oil risk premium', date: isoDaysAgo(9), sentiment: 'negative' },
      { type: 'news', source: 'Financial press', headline: 'Tentative de-escalation framework reported', date: isoDaysAgo(15), sentiment: 'positive' },
    ],
  },
  {
    slug: 'us-china-competition',
    name: 'U.S.–China strategic competition',
    category: 'Geostrategic',
    likelihood: 'high',
    description:
      'Strategic rivalry across trade, technology, military posture, and influence, with periodic flashpoints around Taiwan and the South China Sea.',
    narrative: {
      summary:
        'A structurally elevated risk. Attention rose on new technology restrictions and naval activity in contested waters.',
      developments:
        'Additional entity-list designations and reciprocal measures were announced. Military exercises near contested waters drew market commentary.',
      implications:
        'Persistent bifurcation pressure on semiconductors, capital flows, and dual-listed names. We favour diversified supply chains and monitor cross-strait headlines.',
    },
    series: { seed: 33, base: 1.4, drift: 0.7, volatility: 0.2, shocks: [{ daysAgo: 60, magnitude: 0.8, decay: 50 }, { daysAgo: 300, magnitude: 0.7, decay: 80 }] },
    drivers: [
      { type: 'brokerage', source: 'Sell-side research', headline: 'New export curbs reshape semiconductor supply view', date: isoDaysAgo(7), sentiment: 'negative' },
      { type: 'news', source: 'Financial press', headline: 'Naval exercises near contested waters', date: isoDaysAgo(14), sentiment: 'negative' },
      { type: 'brokerage', source: 'Sell-side research', headline: 'Capital-flow screens add geopolitical filter', date: isoDaysAgo(21), sentiment: 'neutral' },
    ],
  },
  {
    slug: 'global-technology-decoupling',
    name: 'Global technology decoupling',
    category: 'Technology',
    likelihood: 'medium',
    description:
      'Fragmentation of technology standards, supply chains, and data regimes into competing blocs.',
    narrative: {
      summary:
        'Attention is moderately above average, tracking new restrictions on advanced computing and divergent data-governance regimes.',
      developments:
        'Fresh controls on advanced chips and tooling, plus competing data-localization rules, reinforced the decoupling narrative.',
      implications:
        'Capex bifurcation continues. We watch tooling makers and cloud providers with cross-bloc exposure; standards fragmentation raises compliance cost.',
    },
    series: { seed: 44, base: 0.9, drift: 0.6, volatility: 0.18, shocks: [{ daysAgo: 90, magnitude: 0.7, decay: 55 }] },
    drivers: [
      { type: 'brokerage', source: 'Sell-side research', headline: 'Advanced-compute controls widen', date: isoDaysAgo(10), sentiment: 'negative' },
      { type: 'news', source: 'Financial press', headline: 'Competing data-localization rules advance', date: isoDaysAgo(18), sentiment: 'neutral' },
    ],
  },
  {
    slug: 'major-cyber-attacks',
    name: 'Major cyber attack(s)',
    category: 'Security',
    likelihood: 'medium',
    description:
      'Risk of large-scale cyber attacks on critical infrastructure, financial systems, or major corporations.',
    narrative: {
      summary:
        'Attention rose on a cluster of high-profile intrusions affecting financial and infrastructure targets.',
      developments:
        'Several disclosed breaches and ransomware incidents hit operationally critical organizations, prompting regulatory advisories.',
      implications:
        'Tailwind for cybersecurity providers; idiosyncratic downside for breached names. We monitor insurer loss estimates and disclosure cadence.',
    },
    series: { seed: 55, base: 0.4, drift: 0.5, volatility: 0.25, shocks: [{ daysAgo: 30, magnitude: 1.2, decay: 35 }, { daysAgo: 180, magnitude: 0.8, decay: 40 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'Ransomware incident disrupts payments processor', date: isoDaysAgo(5), sentiment: 'negative' },
      { type: 'brokerage', source: 'Sell-side research', headline: 'Cybersecurity demand estimates revised up', date: isoDaysAgo(13), sentiment: 'positive' },
    ],
  },
  {
    slug: 'russia-nato-conflict',
    name: 'Russia–NATO conflict',
    category: 'Conflict',
    likelihood: 'medium',
    description:
      'Risk of direct or proxy escalation between Russia and NATO members, with energy and security spillovers.',
    narrative: {
      summary:
        'Attention is elevated versus the 5-year average but off its peaks, tracking the conflict and periodic escalation scares.',
      developments:
        'Episodic escalation around border regions and energy infrastructure kept the risk in focus; defense-spending commitments rose.',
      implications:
        'Structural support for defense and European energy security themes. We watch gas storage levels and any direct-confrontation signals.',
    },
    series: { seed: 66, base: 1.0, drift: -0.2, volatility: 0.22, shocks: [{ daysAgo: 120, magnitude: 0.9, decay: 60 }, { daysAgo: 400, magnitude: 1.3, decay: 90 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'Energy-infrastructure incident reported', date: isoDaysAgo(11), sentiment: 'negative' },
      { type: 'brokerage', source: 'Sell-side research', headline: 'Defense-budget upgrades across the bloc', date: isoDaysAgo(20), sentiment: 'neutral' },
    ],
  },
  {
    slug: 'emerging-markets-political-crisis',
    name: 'Emerging markets political crisis',
    category: 'Economic',
    likelihood: 'medium',
    description:
      'Risk of a political or debt crisis in one or more major emerging-market economies with contagion potential.',
    narrative: {
      summary:
        'Attention is near its average, with localized stress in a few high-deficit economies rather than broad contagion.',
      developments:
        'Currency pressure and refinancing concerns surfaced in several frontier and EM economies amid tight external financing conditions.',
      implications:
        'Selective rather than systemic. We differentiate by external-funding need and reserve adequacy; watch local-currency yields.',
    },
    series: { seed: 77, base: 0.1, drift: 0.3, volatility: 0.2, shocks: [{ daysAgo: 70, magnitude: 0.6, decay: 45 }] },
    drivers: [
      { type: 'brokerage', source: 'Sell-side research', headline: 'EM external-funding screen flags two sovereigns', date: isoDaysAgo(16), sentiment: 'negative' },
      { type: 'news', source: 'Financial press', headline: 'Currency pressure in frontier markets', date: isoDaysAgo(24), sentiment: 'negative' },
    ],
  },
  {
    slug: 'major-terror-attacks',
    name: 'Major terror attack(s)',
    category: 'Security',
    likelihood: 'low',
    description:
      'Risk of large-scale terror attacks with cross-border or market-relevant economic impact.',
    narrative: {
      summary:
        'Attention is low and near its historical average, with no recent market-moving incidents.',
      developments:
        'Elevated security postures around major events; no large-scale market-relevant incidents this period.',
      implications:
        'Limited direct market impact at present. We treat this as a tail risk and monitor travel/leisure sensitivity around flashpoints.',
    },
    series: { seed: 88, base: -0.4, drift: 0.1, volatility: 0.2, shocks: [{ daysAgo: 220, magnitude: 0.7, decay: 25 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'Heightened security around major events', date: isoDaysAgo(30), sentiment: 'neutral' },
    ],
  },
  {
    slug: 'north-korea-conflict',
    name: 'North Korea conflict',
    category: 'Conflict',
    likelihood: 'low',
    description:
      'Risk of military escalation on the Korean peninsula, including missile tests and direct confrontation.',
    narrative: {
      summary:
        'Attention is low but with periodic spikes tied to missile tests; the baseline regional impact remains contained.',
      developments:
        'A series of missile tests drew brief market commentary; regional defense coordination was reaffirmed.',
      implications:
        'Episodic risk-off for regional assets around test events; limited persistent impact. We watch for any qualitative shift in posture.',
    },
    series: { seed: 99, base: -0.5, drift: 0.05, volatility: 0.22, shocks: [{ daysAgo: 50, magnitude: 0.8, decay: 20 }, { daysAgo: 260, magnitude: 0.6, decay: 20 }] },
    drivers: [
      { type: 'news', source: 'Financial press', headline: 'Series of missile tests reported', date: isoDaysAgo(8), sentiment: 'negative' },
    ],
  },
  {
    slug: 'european-fragmentation',
    name: 'European fragmentation',
    category: 'Geostrategic',
    likelihood: 'low',
    description:
      'Risk of political or fiscal fragmentation within Europe, including spread-widening and policy divergence.',
    narrative: {
      summary:
        'Attention is below average; cohesion has held despite electoral noise and fiscal debates in several member states.',
      developments:
        'Electoral results and fiscal negotiations introduced noise but no systemic spread-widening episode materialized.',
      implications:
        'Contained for now. We monitor peripheral spreads and coalition stability as early indicators; positioning is neutral.',
    },
    series: { seed: 111, base: -0.7, drift: 0.15, volatility: 0.18, shocks: [{ daysAgo: 110, magnitude: 0.5, decay: 40 }] },
    drivers: [
      { type: 'brokerage', source: 'Sell-side research', headline: 'Peripheral-spread monitor stable', date: isoDaysAgo(22), sentiment: 'positive' },
    ],
  },
]

// Likelihood weighting for the composite global indicator.
const LIKELIHOOD_WEIGHT = { high: 3, medium: 2, low: 1 }

// Build the in-memory dataset once.
const RISKS = RISK_DEFS.map((def) => {
  const values = generateSeries(def.series)
  return { ...def, values }
})

// Composite global indicator: likelihood-weighted average across all risks.
const GLOBAL_VALUES = (() => {
  const out = new Array(DAYS).fill(0)
  let weightSum = 0
  for (const r of RISKS) {
    const w = LIKELIHOOD_WEIGHT[r.likelihood]
    weightSum += w
    for (let i = 0; i < DAYS; i++) out[i] += r.values[i] * w
  }
  return out.map((v) => v / weightSum)
})()

// A few annotated events on the global series ("what moved the line").
const GLOBAL_ANNOTATIONS = [
  { daysAgo: 25, label: 'Middle East escalation & shipping disruption' },
  { daysAgo: 40, label: 'New tariff package announced' },
  { daysAgo: 120, label: 'Russia–NATO escalation scare' },
]

// --------------------------------------------------------------------------
// Public helpers
// --------------------------------------------------------------------------

// Convert a value array into [{ date, value }] for the trailing `windowDays`.
// windowDays === null returns the full series.
export function toPoints(values, windowDays = null) {
  const start = windowDays == null ? 0 : Math.max(0, values.length - windowDays)
  const points = []
  for (let i = start; i < values.length; i++) {
    points.push({ date: isoDaysAgo(values.length - 1 - i), value: values[i] })
  }
  return points
}

function deltaOver(values, days) {
  const last = values[values.length - 1]
  const prev = values[Math.max(0, values.length - 1 - days)]
  return last - prev
}

function average(values) {
  return values.reduce((s, v) => s + v, 0) / values.length
}

// Summary row for a single risk (used by table + detail).
function summarize(r) {
  const current = r.values[r.values.length - 1]
  return {
    slug: r.slug,
    name: r.name,
    category: r.category,
    likelihood: r.likelihood,
    description: r.description,
    attention_score: current,
    delta_30d: deltaOver(r.values, 30),
    delta_7d: deltaOver(r.values, 7),
    baseline_5y: average(r.values),
    spark: r.values.slice(-90),
  }
}

export const WINDOWS = [
  { key: '1M', days: 30 },
  { key: '6M', days: 182 },
  { key: '1Y', days: 365 },
  { key: '5Y', days: null },
]

export function getRiskList() {
  return RISKS.map(summarize)
}

export function getRisk(slug) {
  const r = RISKS.find((x) => x.slug === slug)
  if (!r) return null
  return {
    ...summarize(r),
    values: r.values,
    narrative: r.narrative,
    drivers: r.drivers,
  }
}

export function getGlobalOverview() {
  const list = getRiskList()
  const movers = [...list].sort((a, b) => Math.abs(b.delta_30d) - Math.abs(a.delta_30d))
  return {
    values: GLOBAL_VALUES,
    annotations: GLOBAL_ANNOTATIONS.map((a) => ({ ...a, date: isoDaysAgo(a.daysAgo) })),
    score: GLOBAL_VALUES[GLOBAL_VALUES.length - 1],
    delta_30d: deltaOver(GLOBAL_VALUES, 30),
    biggest_mover: movers[0],
    high_likelihood_count: list.filter((r) => r.likelihood === 'high').length,
    risks: list,
    as_of: isoDaysAgo(0),
  }
}
