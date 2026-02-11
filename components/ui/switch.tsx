"use client";

import { cn } from "@/lib/utils";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import * as React from "react";

const Switch = React.forwardRef<
  React.ElementRef<typeof HeadlessSwitch>,
  React.ComponentPropsWithoutRef<typeof HeadlessSwitch>
>(({ className, ...props }, ref) => (
  <HeadlessSwitch
    ref={ref}
    className={cn(
      "group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-blue-600 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:bg-gray-700 dark:data-[checked]:bg-blue-600",
      className
    )}
    {...props}
  >
    <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
  </HeadlessSwitch>
));
Switch.displayName = "Switch";

export { Switch };
