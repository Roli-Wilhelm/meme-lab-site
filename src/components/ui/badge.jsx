import React from "react";

const variants = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-900",
  destructive: "bg-red-600 text-white",
};

export function Badge({ className = "", variant = "default", ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variants[variant] || variants.default
      } ${className}`}
      {...props}
    />
  );
}
