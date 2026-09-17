export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="#20668230" strokeWidth="3" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#206682" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}
// PageLoader is just this, centered: <div className="flex justify-center py-20"><Spinner size={32} /></div>
