import { useState, useEffect, useCallback, useRef } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'

export default function NetworkPage() {
  const [entities, setEntities] = useState([])
  const [relationships, setRelationships] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    async function fetch() {
      const [entRes, relRes] = await Promise.all([
        supabase.from('entities').select('id, name, type, country_code, aum_billions, countries(flag_emoji)'),
        supabase.from('relationships').select('*'),
      ])
      setEntities(entRes.data || [])
      setRelationships(relRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <AppLayout title="Network Graph"><LoadingSpinner /></AppLayout>

  // Arrange nodes in a circle
  const width = 900
  const height = 600
  const cx = width / 2
  const cy = height / 2
  const radius = Math.min(width, height) / 2 - 60

  const nodePositions = {}
  entities.forEach((entity, i) => {
    const angle = (2 * Math.PI * i) / entities.length - Math.PI / 2
    nodePositions[entity.id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })

  const strengthColors = {
    1: '#1e2d5a',
    2: '#2a3f78',
    3: '#06b6d4',
    4: '#22d3ee',
    5: '#67e8f9',
  }

  return (
    <AppLayout title="Network Graph">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">{entities.length} entities &middot; {relationships.length} relationships</p>
          {selectedNode && (
            <Link to={`/swf/${selectedNode.id}`} className="text-xs text-cyan-400 hover:underline">
              View {selectedNode.name} Profile →
            </Link>
          )}
        </div>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: '500px' }}>
          <rect width={width} height={height} fill="#060a16" rx="8" />

          {/* Edges */}
          {relationships.map((rel) => {
            const a = nodePositions[rel.entity_a_id]
            const b = nodePositions[rel.entity_b_id]
            if (!a || !b) return null
            return (
              <line
                key={rel.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={strengthColors[rel.strength] || '#1e2d5a'}
                strokeWidth={rel.strength >= 4 ? 2 : 1}
                opacity={0.6}
              />
            )
          })}

          {/* Nodes */}
          {entities.map((entity) => {
            const pos = nodePositions[entity.id]
            if (!pos) return null
            const isSelected = selectedNode?.id === entity.id
            const nodeRadius = Math.max(8, Math.min(20, (entity.aum_billions || 10) / 50))
            return (
              <g key={entity.id} onClick={() => setSelectedNode(entity)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={pos.x} cy={pos.y} r={nodeRadius}
                  fill={entity.type === 'swf' ? '#22d3ee' : '#f87171'}
                  opacity={isSelected ? 1 : 0.7}
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={2}
                />
                <text
                  x={pos.x} y={pos.y + nodeRadius + 12}
                  textAnchor="middle" fontSize="9"
                  fill={isSelected ? '#ffffff' : '#9ca3af'}
                  fontFamily="var(--font-mono)"
                >
                  {entity.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Selected Node Detail */}
      {selectedNode && (
        <div className="card mt-4">
          <h3 className="text-sm font-medium text-gray-200 mb-2">{selectedNode.countries?.flag_emoji} {selectedNode.name}</h3>
          <p className="text-xs text-gray-400 mb-2">
            {selectedNode.type === 'swf' ? 'Sovereign Wealth Fund' : 'National Champion'}
            {selectedNode.aum_billions && ` · AUM: $${selectedNode.aum_billions}B`}
          </p>
          <div className="text-xs text-gray-500">
            <p>Connections: {relationships.filter(r => r.entity_a_id === selectedNode.id || r.entity_b_id === selectedNode.id).length}</p>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
