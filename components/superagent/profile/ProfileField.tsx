"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
interface ProfileFieldProps {
  label: string;
  value: string;
  onSave?: (value: string) => Promise<void>;
  disabled?: boolean;
  type?: string;
  helperText?: string;
  placeholder?: string;
}
export function ProfileField({
  label,
  value: initialValue,
  onSave,
  disabled,
  type = "text",
  helperText,
  placeholder,
}: ProfileFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  const handleBlur = async () => {
    if (value !== initialValue && !disabled && onSave) {
      setIsSaving(true);
      try {
        await onSave(value);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } catch (err) {
        // Error handled by parent toast usually, reset value if critical
        console.error(err);
        setValue(initialValue);
      } finally {
        setIsSaving(false);
      }
    }
  };
  return (
    <div className="space-y-1.5 relative">
      <div className="flex justify-between items-center h-5">
        <Label className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
          {label}
        </Label>
        <AnimatePresence>
          {isSaving && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-[#9CA3AF] flex items-center gap-1"
            >
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </motion.span>
          )}
          {isSaved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-[#0F766E] flex items-center gap-1 font-medium"
            >
              <Check className="w-3 h-3" /> Saved
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-11 transition-all rounded-none text-[14px]",
          disabled
            ? "bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed"
            : "bg-white border-[#E5E7EB] text-[#111827] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
        )}
      />
      {helperText && (
        <p className="text-[12px] text-[#9CA3AF] pl-0.5">{helperText}</p>
      )}
    </div>
  );
}
