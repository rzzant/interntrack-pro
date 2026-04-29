/**
 * Skeleton loader for stat cards
 */
export default function StatCardSkeleton() {
  return (
    <div className="card border border-white/5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg skeleton" />
      </div>
      <div className="h-9 w-12 skeleton rounded-lg mb-2" />
      <div className="h-3 w-24 skeleton rounded" />
    </div>
  );
}
