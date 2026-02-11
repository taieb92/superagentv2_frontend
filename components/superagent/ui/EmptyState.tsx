import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  icon,
}: {
  title: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-none border border-black/5 bg-white p-8 text-center shadow-sm">
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none border border-black/5 bg-white">
          {icon}
        </div>
      ) : null}
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      {description ? (
        <div className="mt-1 text-sm text-zinc-500">{description}</div>
      ) : null}
      {primaryActionLabel ? (
        <div className="mt-6 flex justify-center">
          <Button onClick={onPrimaryAction}>{primaryActionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
