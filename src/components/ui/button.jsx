import React from "react";

const base =
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border bg-white hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  destructive: "bg-red-600 text-white hover:bg-red-500",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant] || variants.default} ${
        sizes[size] || sizes.default
      } ${className}`}
      {...props}
    />
  );
}
