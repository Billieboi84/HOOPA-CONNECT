import { SkeletonStack } from '@/components/skeleton-stack';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
      </div>
      <SkeletonStack />
    </div>
  );
}
