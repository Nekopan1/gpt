import React from "react";

export default function Chronicle({ events }) {
  return (
    <div className="space-y-2">
      {events?.map((event) => (
        <div key={event.id} className="p-3 rounded bg-slate-900/70 text-white">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{event.title}</span>
            {event.day && <span className="text-xs text-slate-500">Day {event.day}</span>}
          </div>
          <p className="text-sm text-slate-200 mt-1">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
