import React, { createContext, useContext } from "react";

const TabsCtx = createContext(null);

export function Tabs({ value, onValueChange, children }) {
  return (
    <TabsCtx.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className = "", ...props }) {
  return <div className={className} {...props} />;
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;

  return (
    <button
      className={`${className} ${
        active ? "bg-white shadow-sm" : "bg-transparent"
      } px-3 py-2 text-sm`}
      onClick={() => ctx?.onValueChange?.(value)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.value !== value) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
