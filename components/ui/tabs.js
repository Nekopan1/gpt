import React, { useState } from "react";

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);

  const context = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    if (child.type.displayName === "TabsList") {
      return React.cloneElement(child, { value, onChange: setValue });
    }
    if (child.type.displayName === "TabsContent") {
      return React.cloneElement(child, { value });
    }
    return child;
  });

  return <div className={className}>{context}</div>;
}

export function TabsList({ children, value, onChange, className = "" }) {
  const triggers = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child, { activeValue: value, onChange });
  });
  return <div className={className}>{triggers}</div>;
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ children, value, activeValue, onChange, className = "", ...props }) {
  const active = activeValue === value;
  return (
    <button
      className={`${className} ${active ? "text-white" : "text-slate-400"}`}
      onClick={() => onChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ children, value, activeValue, className = "", ...props }) {
  if (value !== activeValue) return null;
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
TabsContent.displayName = "TabsContent";

export default Tabs;
