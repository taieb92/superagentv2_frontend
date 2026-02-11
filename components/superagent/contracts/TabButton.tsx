import { cn } from "@/lib/utils";

export function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-4 text-[14px] font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 px-1",
        active
          ? "border-[#0F766E] text-[#0F766E]"
          : "border-transparent text-[#6B7280] hover:text-[#4B5563] hover:border-[#D1D5DB]"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-none border",
            active
              ? "bg-[#ECFDF5] text-[#0F766E] border-[#0F766E]/20"
              : "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
