import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-md border bg-slate-800/70 px-3 py-2 text-white ${className}`}
      {...props}
    />
  );
}

export default Input;
