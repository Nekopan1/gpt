import React from "react";

export function Badge({ children, className = "", variant = "default", ...props }) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const variants = {
    default: "bg-purple-700/40 text-purple-100",
    outline: "border border-purple-700/50 text-purple-200"
  };
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
