import { useMemo } from 'react'
import { getGlobalOverview, getRiskList, getRisk } from '@/lib/riskData'

// Thin hooks over the demo risk dataset. The data is synchronous today, so
// these compute with useMemo and report loading:false. They keep a hook-shaped
// API so swapping in an async API later only changes these three functions.

export function useRiskOverview() {
  const overview = useMemo(() => getGlobalOverview(), [])
  return { overview, loading: false }
}

export function useRiskList() {
  const risks = useMemo(() => getRiskList(), [])
  return { risks, loading: false }
}

export function useRisk(slug) {
  const risk = useMemo(() => getRisk(slug), [slug])
  return { risk, loading: false }
}
