import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'

// Simple Mercator projection
function project(lat, lng, width, height) {
  const x = (lng + 180) * (width / 360)
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const y = height / 2 - (width * mercN) / (2 * Math.PI)
  return { x, y }
}

export default function MapPage() {
  const [entities, setEntities] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    async function fetch() {
      const [entRes, countryRes] = await Promise.all([
        supabase.from('entities').select('id, name, type, country_code, aum_billions'),
        supabase.from('countries').select('*'),
      ])
      setEntities(entRes.data || [])
      setCountries(countryRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <AppLayout title="World Map"><LoadingSpinner /></AppLayout>

  const width = 960
  const height = 500

  // Group entities by country
  const byCountry = {}
  entities.forEach((e) => {
    if (!byCountry[e.country_code]) byCountry[e.country_code] = []
    byCountry[e.country_code].push(e)
  })

  const countryDots = countries
    .filter((c) => c.lat && c.lng)
    .map((c) => ({
      ...c,
      entities: byCountry[c.code] || [],
      ...project(c.lat, c.lng, width, height),
    }))

  return (
    <AppLayout title="World Map">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">{Object.keys(byCountry).length} countries with entities</p>
          {selectedCountry && (
            <button onClick={() => setSelectedCountry(null)} className="text-xs text-gray-400 hover:text-gray-300">Clear selection</button>
          )}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: '400px' }}>
          <rect width={width} height={height} fill="#060a16" rx="8" />

          {/* Grid lines */}
          {Array.from({ length: 7 }, (_, i) => {
            const y = (height / 6) * i
            return <line key={`h${i}`} x1="0" y1={y} x2={width} y2={y} stroke="#0f1a3a" strokeWidth="0.5" />
          })}
          {Array.from({ length: 13 }, (_, i) => {
            const x = (width / 12) * i
            return <line key={`v${i}`} x1={x} y1="0" x2={x} y2={height} stroke="#0f1a3a" strokeWidth="0.5" />
          })}

          {/* Country dots */}
          {countryDots.map((dot) => {
            const hasEntities = dot.entities.length > 0
            const isSelected = selectedCountry?.code === dot.code
            const dotSize = hasEntities ? Math.max(4, Math.min(12, dot.entities.length * 3)) : 2

            return (
              <g key={dot.code} onClick={() => hasEntities && setSelectedCountry(dot)} style={{ cursor: hasEntities ? 'pointer' : 'default' }}>
                {hasEntities && (
                  <circle cx={dot.x} cy={dot.y} r={dotSize + 4} fill="#22d3ee" opacity={0.1}>
                    <animate attributeName="r" values={`${dotSize + 2};${dotSize + 6};${dotSize + 2}`} dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={dot.x} cy={dot.y} r={dotSize}
                  fill={hasEntities ? '#22d3ee' : '#1e2d5a'}
                  opacity={hasEntities ? (isSelected ? 1 : 0.7) : 0.3}
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={1.5}
                />
                {hasEntities && (
                  <text x={dot.x} y={dot.y - dotSize - 4} textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="var(--font-mono)">
                    {dot.flag_emoji} {dot.code}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Country Detail */}
      {selectedCountry && (
        <div className="card mt-4">
          <h3 className="text-sm font-medium text-gray-200 mb-3">
            {selectedCountry.flag_emoji} {selectedCountry.name}
            <span className="text-xs text-gray-500 ml-2">{selectedCountry.region}</span>
          </h3>
          <div className="space-y-2">
            {selectedCountry.entities.map((entity) => (
              <Link
                key={entity.id}
                to={`/${entity.type === 'swf' ? 'swf' : 'champions'}/${entity.id}`}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-navy-800 transition-colors"
              >
                <span className="text-sm text-gray-200">{entity.name}</span>
                {entity.aum_billions && <span className="text-xs font-mono text-cyan-400">${entity.aum_billions}B</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
