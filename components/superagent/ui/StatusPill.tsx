import { cn } from "@/lib/utils";

const map: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  WAITING_SIGNATURE: {
    label: "Waiting signature",
    className: "bg-amber-50 text-amber-800 border-amber-200/40",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-[#ECFDF5] text-[#0F766E] border-[#0F766E]/20",
  },
  BLOCKED: {
    label: "Blocked",
    className: "bg-rose-50 text-rose-800 border-rose-200/40",
  },
};

export function StatusPill({ status }: Readonly<{ status: string }>) {
  const s = map[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-500 border-zinc-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-0.5 text-[12px] font-medium transition-colors",
        s.className
      )}
    >
      {s.label}
    </span>
  );
}
