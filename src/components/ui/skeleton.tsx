// the premium loader referenced back in step 6 - a pulsing placeholder
// shown instead of a blank screen while data is still loading
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

// usage anywhere data is still loading, e.g. ScheduleList before sessions arrive:
// {loading ? [1,2,3].map((i) => <Skeleton key={i} className="h-20 mb-2" />) : <realContent />}
