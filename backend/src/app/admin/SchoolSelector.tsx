"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type School = { id: string; name: string; slug: string };

export function SchoolSelector({ schools }: { schools: School[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSchoolId = searchParams.get("schoolId") ?? schools[0]?.id ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("schoolId", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={currentSchoolId}
      onChange={handleChange}
      className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 max-w-[200px] truncate"
    >
      {schools.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
