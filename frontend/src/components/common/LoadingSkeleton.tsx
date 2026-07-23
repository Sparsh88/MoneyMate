interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-28 ${className}`} />
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-2 w-1/3 rounded" />
      </div>
      <div className="skeleton h-4 w-16 rounded" />
    </div>
  )
}

export function SkeletonChart({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} style={{ height: 280 }} />
}

export default function LoadingSkeleton({ rows = 5, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
