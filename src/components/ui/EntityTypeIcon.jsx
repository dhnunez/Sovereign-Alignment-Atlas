export default function EntityTypeIcon({ type, size = 16 }) {
  if (type === 'swf') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="10" width="4" height="10" />
        <rect x="10" y="6" width="4" height="14" />
        <rect x="17" y="10" width="4" height="10" />
        <path d="M2 20h20" />
        <path d="M12 2L2 8h20L12 2z" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C5.3 4 6 4.7 6 5.5V9" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C18.7 4 18 4.7 18 5.5V9" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
