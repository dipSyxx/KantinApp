import { View, Text, TouchableOpacity, ScrollView } from "react-native";

type Props = {
  currentWeek: number;
  currentYear: number;
  selectedWeek: number;
  selectedYear: number;
  onSelectWeek: (year: number, week: number) => void;
};

export function WeekSelector({
  currentWeek,
  currentYear,
  selectedWeek,
  selectedYear,
  onSelectWeek,
}: Props) {
  // Show current week, next week, and a few surrounding weeks
  const weeks = [];
  for (let i = -1; i <= 3; i++) {
    let w = currentWeek + i;
    let y = currentYear;
    if (w > 52) {
      w -= 52;
      y += 1;
    }
    if (w < 1) {
      w += 52;
      y -= 1;
    }
    weeks.push({ year: y, week: w });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {weeks.map(({ year, week }) => {
        const isSelected = week === selectedWeek && year === selectedYear;
        const isCurrent = week === currentWeek && year === currentYear;

        return (
          <TouchableOpacity
            key={`${year}-${week}`}
            onPress={() => onSelectWeek(year, week)}
            className={`px-5 py-2.5 rounded-full ${
              isSelected
                ? "bg-brand-green"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isSelected ? "text-white" : "text-gray-700"
              }`}
            >
              Uke {week}
              {isCurrent && !isSelected ? " (nå)" : ""}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
