"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Vote,
  UtensilsCrossed,
  CalendarDays,
  TrendingUp,
  BarChart3,
  ThumbsUp,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { DateFilter } from "./components/DateFilter";
import { VoteDistribution } from "./components/VoteDistribution";
import { TrendChart } from "./components/TrendChart";
import { CategoryBreakdown } from "./components/CategoryBreakdown";
import { DishTable } from "./components/DishTable";
import { EngagementCard } from "./components/EngagementCard";
import { ExportButtons } from "./components/ExportButtons";

type AnalyticsData = {
  summary: {
    totalItems: number;
    totalVotes: number;
    totalDishes: number;
    averageVotesPerItem: number;
    avgScore: number;
  };
  voteDistribution: { up: number; mid: number; down: number };
  categoryBreakdown: {
    category: string;
    up: number;
    mid: number;
    down: number;
    total: number;
  }[];
  dailyTrend: {
    date: string;
    up: number;
    mid: number;
    down: number;
    total: number;
  }[];
  dishes: {
    dish: string;
    imageUrl: string | null;
    up: number;
    mid: number;
    down: number;
    total: number;
    score: number;
    positivePct: number;
    history: {
      date: string;
      up: number;
      mid: number;
      down: number;
      total: number;
    }[];
  }[];
  engagement: {
    itemsWithVotes: number;
    itemsTotal: number;
    pctWithVotes: number;
    avgVotesPerItem: number;
    mostActiveDay: string;
    mostActiveDayCount: number;
  };
  items: {
    date: string;
    dish: string;
    category: string;
    status: string;
    votes: { up: number; mid: number; down: number; total: number };
    avgScore: number;
  }[];
};

export default function AnalyticsPage() {
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleDateChange(newFrom?: string, newTo?: string) {
    setFrom(newFrom);
    setTo(newTo);
  }

  const stats: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    bg: string;
  }[] = data
    ? [
        {
          label: "Totale stemmer",
          value: data.summary.totalVotes,
          icon: Vote,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          label: "Unike retter",
          value: data.summary.totalDishes,
          icon: UtensilsCrossed,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          label: "Menypunkter",
          value: data.summary.totalItems,
          icon: CalendarDays,
          color: "text-purple-600",
          bg: "bg-purple-50",
        },
        {
          label: "Snitt stemmer/rett",
          value: data.summary.averageVotesPerItem,
          icon: TrendingUp,
          color: "text-cyan-600",
          bg: "bg-cyan-50",
        },
        {
          label: "Retter med stemmer",
          value: `${data.engagement.pctWithVotes}%`,
          icon: BarChart3,
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
        {
          label: "Gj.snitt score",
          value: data.summary.avgScore,
          icon: ThumbsUp,
          color: "text-green-600",
          bg: "bg-green-50",
        },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Analyse</h1>
        {data && (
          <ExportButtons from={from} to={to} items={data.items} />
        )}
      </div>

      {/* Date filter */}
      <div className="mb-6">
        <DateFilter from={from} to={to} onChange={handleDateChange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-center text-gray-400 py-24">
          Kunne ikke laste data
        </p>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}
                  >
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <span className="text-2xl font-bold block">{s.value}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Vote distribution */}
          <VoteDistribution
            up={data.voteDistribution.up}
            mid={data.voteDistribution.mid}
            down={data.voteDistribution.down}
          />

          {/* Trend chart */}
          <TrendChart data={data.dailyTrend} />

          {/* Category breakdown */}
          <CategoryBreakdown data={data.categoryBreakdown} />

          {/* Dish table */}
          <DishTable dishes={data.dishes} />

          {/* Engagement */}
          <EngagementCard data={data.engagement} />
        </div>
      )}
    </div>
  );
}
