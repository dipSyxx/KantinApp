"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { nb } from "date-fns/locale";

export function RelativeTime({ date }: { date: string | Date }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const d = typeof date === "string" ? new Date(date) : date;
    const update = () =>
      setText(formatDistanceToNow(d, { addSuffix: true, locale: nb }));
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [date]);

  if (!text) return null;

  return <span className="text-gray-400 text-xs whitespace-nowrap">{text}</span>;
}
