import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "solid", children, ...props }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  const styles =
    variant === "outline"
      ? "border border-purple-500/50 text-purple-200"
      : "bg-purple-600 text-white";

  return (
    <span className={cn(base, styles, className)} {...props}>
      {children}
    </span>
  );
}

export default Badge;
