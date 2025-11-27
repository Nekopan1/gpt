import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border bg-slate-800/70 px-3 py-2 text-white ${className}`}
      {...props}
    />
  );
}

export default Textarea;
