import React from "react";

export default function InfoGrid({ title, icon: Icon, items }) {
  const filled = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (filled.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {filled.map(({ label, value }) => (
          <div key={label} className="border-b border-gray-50 pb-2 last:border-0">
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm text-gray-800 font-medium">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}