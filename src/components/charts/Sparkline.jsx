// Tiny inline trend line for table rows. Color encodes direction: rising
// market attention is the notable/negative case (red), falling is green.

export default function Sparkline({ values, width = 96, height = 28 }) {
  if (!values || values.length < 2) return null
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  const stepX = width / (values.length - 1)
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i * stepX).toFixed(2)} ${(height - ((v - lo) / span) * height).toFixed(2)}`)
    .join(' ')
  const rising = values[values.length - 1] >= values[0]
  const color = rising ? '#f87171' : '#4ade80'
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
