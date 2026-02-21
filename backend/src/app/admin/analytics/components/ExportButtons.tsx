"use client";

import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";

type AnalyticsItem = {
  date: string;
  dish: string;
  category: string;
  status: string;
  votes: { up: number; mid: number; down: number; total: number };
  avgScore: number;
};

export function ExportButtons({
  from,
  to,
  items,
}: {
  from?: string;
  to?: string;
  items: AnalyticsItem[];
}) {
  const [copied, setCopied] = useState(false);

  const csvUrl = `/api/admin/analytics?format=csv${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`;

  function handleCopy() {
    const headers =
      "Date\tDish\tCategory\tUp\tMid\tDown\tTotal\tAvg Score";
    const rows = items.map(
      (a) =>
        `${a.date}\t${a.dish}\t${a.category}\t${a.votes.up}\t${a.votes.mid}\t${a.votes.down}\t${a.votes.total}\t${a.avgScore}`
    );
    const text = [headers, ...rows].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {copied ? "Kopiert!" : "Kopier"}
      </button>
      <a
        href={csvUrl}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Last ned CSV
      </a>
    </div>
  );
}
