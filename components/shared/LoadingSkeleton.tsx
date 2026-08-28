import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  variant?: "card" | "list" | "detail";
}

export function LoadingSkeleton({
  count = 1,
  className,
  variant = "card",
}: LoadingSkeletonProps) {
  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-slate-200/80 bg-white shadow-xs">
          <Skeleton className="h-48 w-full rounded-none" />
          <CardHeader className="p-4 pb-2 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-5 w-4/5" />
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2.5">
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
