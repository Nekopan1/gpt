import React from "react";
function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function Button({ children, className = "", variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-purple-600 text-purple-200 hover:bg-purple-900/30",
    ghost: "text-purple-200 hover:bg-purple-900/30"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "p-2"
  };

  return (
    <button className={classNames(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export default Button;
