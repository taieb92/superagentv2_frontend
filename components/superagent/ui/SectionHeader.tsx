import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

export function SectionHeader({
  title,
  meta,
  right,
  action,
}: {
  title: string;
  meta?: string;
  right?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 pb-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        {meta ? <p className="text-sm text-zinc-500">{meta}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {action}
      </div>
    </div>
  );
}

export function CountBadge({ count }: { count: number }) {
  return (
    <Badge
      variant="secondary"
      className="border border-black/5 bg-white text-zinc-700"
    >
      {count}
    </Badge>
  );
}
