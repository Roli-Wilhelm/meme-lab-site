import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={`border bg-white ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`p-6 pb-2 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`font-semibold leading-none ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-2 ${className}`} {...props} />;
}
