// ============================================================================
// Mock Supabase client — works with built-in demo data, no database needed
// ============================================================================

import {
  countries,
  entities,
  investments,
  events,
  relationships,
  alerts,
  notifications,
  generateId,
} from './mockData'

// In-memory data store (mutable copies so inserts/updates/deletes work)
const store = {
  countries: [...countries],
  entities: [...entities],
  investments: [...investments],
  events: [...events],
  relationships: [...relationships],
  alerts: [...alerts],
  notifications: [...notifications],
}

// ---------------------------------------------------------------------------
// Query builder — mimics the Supabase JS client chain API
// ---------------------------------------------------------------------------
class MockQueryBuilder {
  constructor(tableName) {
    this._table = tableName
    this._filters = []
    this._orderCol = null
    this._orderAsc = true
    this._orderNullsFirst = false
    this._limitN = null
    this._isSingle = false
    this._operation = 'select'
    this._payload = null
  }

  // -- SELECT chain methods --------------------------------------------------
  select(_cols) {
    return this
  }

  eq(col, val) {
    this._filters.push({ type: 'eq', col, val })
    return this
  }

  or(filterStr) {
    this._filters.push({ type: 'or', str: filterStr })
    return this
  }

  order(col, opts = {}) {
    this._orderCol = col
    this._orderAsc = opts.ascending !== false
    this._orderNullsFirst = !!opts.nullsFirst
    return this
  }

  limit(n) {
    this._limitN = n
    return this
  }

  single() {
    this._isSingle = true
    return this
  }

  // -- MUTATE chain methods ---------------------------------------------------
  insert(data) {
    this._operation = 'insert'
    this._payload = data
    return this
  }

  update(data) {
    this._operation = 'update'
    this._payload = data
    return this
  }

  delete() {
    this._operation = 'delete'
    return this
  }

  // -- Resolve foreign-key joins based on table ------------------------------
  _resolveJoins(rows) {
    const table = this._table
    return rows.map((row) => {
      const r = { ...row }

      if (table === 'entities' && r.country_code) {
        r.countries = store.countries.find((c) => c.code === r.country_code) || null
      }

      if (table === 'events' && r.entity_id) {
        r.entities = store.entities.find((e) => e.id === r.entity_id) || null
      }

      if (table === 'investments' && r.investor_entity_id) {
        r.investor = store.entities.find((e) => e.id === r.investor_entity_id) || null
      }

      if (table === 'relationships') {
        r.entity_a = store.entities.find((e) => e.id === r.entity_a_id) || null
        r.entity_b = store.entities.find((e) => e.id === r.entity_b_id) || null
      }

      if (table === 'alerts' && r.entity_id) {
        r.entities = store.entities.find((e) => e.id === r.entity_id) || null
      }

      return r
    })
  }

  // -- Execute the built query ------------------------------------------------
  _execute() {
    const tableData = store[this._table]
    if (!tableData) return { data: [], error: null }

    // INSERT
    if (this._operation === 'insert') {
      const newItem = { id: generateId(), ...this._payload, created_at: new Date().toISOString() }
      tableData.push(newItem)
      return { data: newItem, error: null }
    }

    // UPDATE
    if (this._operation === 'update') {
      let targets = [...tableData]
      for (const f of this._filters) {
        if (f.type === 'eq') targets = targets.filter((r) => String(r[f.col]) === String(f.val))
      }
      targets.forEach((item) => {
        const idx = tableData.findIndex((r) => r.id === item.id)
        if (idx >= 0) Object.assign(tableData[idx], this._payload)
      })
      return { data: targets, error: null }
    }

    // DELETE
    if (this._operation === 'delete') {
      let targets = [...tableData]
      for (const f of this._filters) {
        if (f.type === 'eq') targets = targets.filter((r) => String(r[f.col]) === String(f.val))
      }
      const deleteIds = new Set(targets.map((r) => r.id))
      store[this._table] = tableData.filter((r) => !deleteIds.has(r.id))
      return { data: targets, error: null }
    }

    // SELECT
    let results = [...tableData]

    for (const f of this._filters) {
      if (f.type === 'eq') {
        results = results.filter((r) => String(r[f.col]) === String(f.val))
      } else if (f.type === 'or') {
        const parts = f.str.split(',')
        results = results.filter((r) =>
          parts.some((part) => {
            const m = part.match(/^(\w+)\.eq\.(.+)$/)
            return m && String(r[m[1]]) === String(m[2])
          }),
        )
      }
    }

    results = this._resolveJoins(results)

    if (this._orderCol) {
      results.sort((a, b) => {
        const aVal = a[this._orderCol]
        const bVal = b[this._orderCol]
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return this._orderNullsFirst ? -1 : 1
        if (bVal == null) return this._orderNullsFirst ? 1 : -1
        if (aVal < bVal) return this._orderAsc ? -1 : 1
        if (aVal > bVal) return this._orderAsc ? 1 : -1
        return 0
      })
    }

    if (this._limitN) results = results.slice(0, this._limitN)

    if (this._isSingle) {
      return { data: results[0] || null, error: results[0] ? null : { message: 'Not found' } }
    }

    return { data: results, error: null }
  }

  // -- Make the builder thenable (so `await query` works) --------------------
  then(resolve, reject) {
    try {
      resolve(this._execute())
    } catch (e) {
      if (reject) reject(e)
    }
  }
}

// ---------------------------------------------------------------------------
// Mock auth — auto-logged-in demo user
// ---------------------------------------------------------------------------
const DEMO_SESSION = {
  user: {
    id: 'demo-user',
    email: 'demo@sovereign-atlas.app',
    user_metadata: { full_name: 'Demo User' },
  },
  access_token: 'demo-token',
}

const mockAuth = {
  getSession: () => Promise.resolve({ data: { session: DEMO_SESSION } }),

  onAuthStateChange: (callback) => {
    // Fire immediately with the demo session
    setTimeout(() => callback('SIGNED_IN', DEMO_SESSION), 0)
    return { data: { subscription: { unsubscribe: () => {} } } }
  },

  signInWithPassword: () => Promise.resolve({ error: null }),
  signUp: () => Promise.resolve({ error: null }),
  signOut: () => Promise.resolve(),
}

// ---------------------------------------------------------------------------
// Exported client — drop-in replacement for createClient()
// ---------------------------------------------------------------------------
export const supabase = {
  from: (tableName) => new MockQueryBuilder(tableName),
  auth: mockAuth,
}
