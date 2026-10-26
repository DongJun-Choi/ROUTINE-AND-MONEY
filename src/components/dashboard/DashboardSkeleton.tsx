function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6 ${className}`}>
      <div className="h-5 w-28 animate-pulse rounded-md bg-subtle" />
      <div className="h-8 w-40 animate-pulse rounded-md bg-subtle" />
      <div className="h-4 w-48 animate-pulse rounded-md bg-subtle" />
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="대시보드를 불러오는 중" className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        {[0, 1, 2, 3].map((index) => <SkeletonCard key={index} className="flex-[1_1_220px]" />)}
      </div>
      <div className="flex flex-wrap gap-6">
        <SkeletonCard className="min-h-[360px] flex-[7_1_560px]" />
        <SkeletonCard className="min-h-[360px] flex-[5_1_380px]" />
      </div>
    </div>
  );
}
