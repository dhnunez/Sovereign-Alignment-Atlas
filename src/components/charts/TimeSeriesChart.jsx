import { useMemo, useRef, useState } from 'react'

// Lightweight dependency-free time-series chart: gradient area + line, an
// optional horizontal baseline reference, optional event annotations, and a
// hover crosshair with tooltip. Renders into a fixed viewBox and scales to the
// container width via preserveAspectRatio.

const VW = 1000 // viewBox width
const PAD_X = 8
const PAD_TOP = 12
const PAD_BOTTOM = 18

export default function TimeSeriesChart({
  points,
  baseline = null,
  annotations = [],
  height = 260,
  color = '#22d3ee',
  formatValue = (v) => v.toFixed(2),
}) {
  const wrapRef = useRef(null)
  const [hover, setHover] = useState(null) // { index, clientX }

  const { path, area, min, max, x, y, baselineY, annPoints } = useMemo(() => {
    const vals = points.map((p) => p.value)
    let lo = Math.min(...vals, baseline ?? Infinity)
    let hi = Math.max(...vals, baseline ?? -Infinity)
    if (lo === hi) {
      lo -= 1
      hi += 1
    }
    const pad = (hi - lo) * 0.12
    lo -= pad
    hi += pad
    const innerW = VW - PAD_X * 2
    const innerH = height - PAD_TOP - PAD_BOTTOM
    const xOf = (i) => PAD_X + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
    const yOf = (v) => PAD_TOP + innerH - ((v - lo) / (hi - lo)) * innerH
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(2)} ${yOf(p.value).toFixed(2)}`).join(' ')
    const a = `${d} L ${xOf(points.length - 1).toFixed(2)} ${(height - PAD_BOTTOM).toFixed(2)} L ${xOf(0).toFixed(2)} ${(height - PAD_BOTTOM).toFixed(2)} Z`
    const annP = annotations
      .map((ann) => {
        const idx = points.findIndex((p) => p.date >= ann.date)
        if (idx < 0) return null
        return { ...ann, index: idx, cx: xOf(idx), cy: yOf(points[idx].value) }
      })
      .filter(Boolean)
    return {
      path: d,
      area: a,
      min: lo,
      max: hi,
      x: xOf,
      y: yOf,
      baselineY: baseline == null ? null : yOf(baseline),
      annPoints: annP,
    }
  }, [points, baseline, height, annotations])

  function handleMove(e) {
    const rect = wrapRef.current.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const index = Math.round(frac * (points.length - 1))
    setHover({ index, frac })
  }

  const gradId = useMemo(() => `grad-${Math.random().toString(36).slice(2, 8)}`, [])
  const hoverPoint = hover ? points[hover.index] : null

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${VW} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height={height}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* zero line */}
        {min < 0 && max > 0 && (
          <line x1={PAD_X} x2={VW - PAD_X} y1={y(0)} y2={y(0)} stroke="#2a3f78" strokeWidth="1" strokeDasharray="2 4" />
        )}

        {/* 5y baseline reference */}
        {baselineY != null && (
          <line x1={PAD_X} x2={VW - PAD_X} y1={baselineY} y2={baselineY} stroke="#eab308" strokeWidth="1" strokeDasharray="5 4" opacity="0.6" />
        )}

        <path d={area} fill={`url(#${gradId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />

        {/* annotations */}
        {annPoints.map((ann) => (
          <g key={ann.label}>
            <line x1={ann.cx} x2={ann.cx} y1={PAD_TOP} y2={height - PAD_BOTTOM} stroke="#f87171" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <circle cx={ann.cx} cy={ann.cy} r="3.5" fill="#f87171" stroke="#0a1025" strokeWidth="1.5" />
          </g>
        ))}

        {/* hover crosshair */}
        {hoverPoint && (
          <g>
            <line x1={x(hover.index)} x2={x(hover.index)} y1={PAD_TOP} y2={height - PAD_BOTTOM} stroke="#94a3b8" strokeWidth="1" />
            <circle cx={x(hover.index)} cy={y(hoverPoint.value)} r="4" fill={color} stroke="#0a1025" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* tooltip (HTML overlay so text isn't stretched by the viewBox) */}
      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-md border border-navy-600 bg-navy-800/95 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `calc(${(hover.frac * 100).toFixed(2)}% )`,
            transform: `translateX(${hover.frac > 0.7 ? '-110%' : '12px'})`,
          }}
        >
          <div className="font-mono text-white">{formatValue(hoverPoint.value)}</div>
          <div className="text-gray-400">{hoverPoint.date}</div>
        </div>
      )}
    </div>
  )
}
