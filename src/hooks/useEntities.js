import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useEntities(type) {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('entities')
        .select('*, countries(name, flag_emoji, region)')
        .order('aum_billions', { ascending: false, nullsFirst: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error: err } = await query
      if (err) throw err
      setEntities(data || [])
    } catch (err) {
      setError(err.message)
      setEntities([])
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchEntities()
  }, [fetchEntities])

  return { entities, loading, error, refetch: fetchEntities }
}

export function useEntity(id) {
  const [entity, setEntity] = useState(null)
  const [investments, setInvestments] = useState([])
  const [events, setEvents] = useState([])
  const [relationships, setRelationships] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntity = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [entityRes, investRes, eventsRes, relRes] = await Promise.all([
        supabase
          .from('entities')
          .select('*, countries(name, flag_emoji, region)')
          .eq('id', id)
          .single(),
        supabase
          .from('investments')
          .select('*')
          .eq('investor_entity_id', id)
          .order('announced_date', { ascending: false }),
        supabase
          .from('events')
          .select('*')
          .eq('entity_id', id)
          .order('event_date', { ascending: false }),
        supabase
          .from('relationships')
          .select('*, entity_a:entities!relationships_entity_a_id_fkey(id, name, type, country_code), entity_b:entities!relationships_entity_b_id_fkey(id, name, type, country_code)')
          .or(`entity_a_id.eq.${id},entity_b_id.eq.${id}`),
      ])

      if (entityRes.error) throw entityRes.error
      setEntity(entityRes.data)
      setInvestments(investRes.data || [])
      setEvents(eventsRes.data || [])
      setRelationships(relRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEntity()
  }, [fetchEntity])

  return { entity, investments, events, relationships, loading, error, refetch: fetchEntity }
}

export function useRecentActivity(limit = 20) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { data, error: err } = await supabase
          .from('events')
          .select('*, entities(id, name, type)')
          .order('event_date', { ascending: false })
          .limit(limit)

        if (err) throw err
        setActivities(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [limit])

  return { activities, loading, error }
}

export function useInvestments(filters = {}) {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInvestments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('investments')
        .select('*, investor:entities!investments_investor_entity_id_fkey(id, name, type, country_code)')
        .order('announced_date', { ascending: false })

      if (filters.entityId) query = query.eq('investor_entity_id', filters.entityId)
      if (filters.sector) query = query.eq('target_sector', filters.sector)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error: err } = await query
      if (err) throw err
      setInvestments(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.entityId, filters.sector, filters.status])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  return { investments, loading, error, refetch: fetchInvestments }
}
