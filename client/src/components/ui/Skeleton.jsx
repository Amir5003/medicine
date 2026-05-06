/**
 * Skeleton loaders using Tailwind animate-pulse.
 *
 * Skeleton     — base animated placeholder block (default export)
 * SkeletonLine — single text-line placeholder
 * SkeletonCard — medicine card placeholder (image + 3 lines)
 * SkeletonPanel — wide panel placeholder (for AlternatePanel, OrderDetail, etc.)
 */

/**
 * Base skeleton block — use with className to set height/width.
 * e.g. <Skeleton className="h-4 w-24" />
 */
export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  )
}

export function SkeletonLine({ className = '' }) {
  return (
    <div
      className={`h-4 bg-gray-200 rounded animate-pulse ${className}`}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-3 ${className}`}
    >
      {/* Image placeholder */}
      <div className="w-full h-40 bg-gray-200 rounded-xl animate-pulse" />
      {/* Title */}
      <SkeletonLine className="w-3/4" />
      {/* Subtitle */}
      <SkeletonLine className="w-1/2" />
      {/* Price */}
      <SkeletonLine className="w-1/3" />
    </div>
  )
}

export function SkeletonPanel({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4 ${className}`}>
      <SkeletonLine className="w-1/4 h-5" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="w-1/2" />
            <SkeletonLine className="w-1/3" />
          </div>
          <SkeletonLine className="w-16 h-8" />
        </div>
      ))}
    </div>
  )
}


