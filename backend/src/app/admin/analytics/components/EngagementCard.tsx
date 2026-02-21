"use client";

import { Activity, Percent, Calendar } from "lucide-react";

type EngagementData = {
  itemsWithVotes: number;
  itemsTotal: number;
  pctWithVotes: number;
  avgVotesPerItem: number;
  mostActiveDay: string;
  mostActiveDayCount: number;
};

export function EngagementCard({ data }: { data: EngagementData }) {
  const metrics = [
    {
      icon: Percent,
      label: "Retter med stemmer",
      value: `${data.pctWithVotes}%`,
      detail: `${data.itemsWithVotes} av ${data.itemsTotal} menypunkter`,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: Activity,
      label: "Snitt stemmer per servert rett",
      value: data.avgVotesPerItem.toString(),
      detail: "Kun retter som har fått stemmer",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      icon: Calendar,
      label: "Mest aktive ukedag",
      value: data.mostActiveDay,
      detail: `${data.mostActiveDayCount} stemmer totalt`,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">
        Engasjement
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}
            >
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div>
              <div className="text-xl font-bold">{m.value}</div>
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className="text-[10px] text-gray-400">{m.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
