interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={[
        'relative overflow-hidden bg-slate-200 dark:bg-slate-700 rounded-lg',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        'before:animate-shimmer before:bg-[length:200%_100%]',
        className,
      ].join(' ')}
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-card border border-slate-100 dark:border-slate-700 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-shrink-0 w-72 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          {[0, 1, 2].map((j) => (
            <TaskCardSkeleton key={j} />
          ))}
        </div>
      ))}
    </div>
  );
}
