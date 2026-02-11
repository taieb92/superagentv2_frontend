import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

export function SectionHeader({
  title,
  meta,
  right,
}: {
  title: string;
  meta?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {meta ? <p className="text-sm text-zinc-500">{meta}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
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
