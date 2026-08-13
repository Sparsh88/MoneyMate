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

export function SkeletonGrid({ count = 4, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function PageFallback() {
  return (
    <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded-md" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <SkeletonGrid count={4} />
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="skeleton h-72 rounded-2xl xl:col-span-3" />
        <div className="skeleton h-72 rounded-2xl xl:col-span-2" />
      </div>
    </div>
  )
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

