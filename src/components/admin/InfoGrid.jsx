import React from "react";

export default function InfoGrid({ title, items }) {
  const filled = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== "");
  if (filled.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filled.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm text-gray-800 font-medium">{String(value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}