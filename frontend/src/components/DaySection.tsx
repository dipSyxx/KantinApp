import { View, Text } from "react-native";
import { formatDayName, formatShortDate, isToday } from "@/lib/week";

type Props = {
  date: string;
  isOpen: boolean;
  notes: string | null;
};

export function DayHeader({ date, isOpen, notes }: Props) {
  const dayName = formatDayName(date);
  const shortDate = formatShortDate(date);
  const today = isToday(date);

  return (
    <View className="flex-row items-center px-4 pt-4 pb-2">
      <View className="flex-row items-center flex-1">
        <Text className={`text-lg font-bold ${today ? "text-brand-green" : "text-gray-800"}`}>
          {dayName}
        </Text>
        <Text className="text-sm text-gray-400 ml-2">{shortDate}</Text>
        {today && (
          <View className="bg-brand-green px-2 py-0.5 rounded-full ml-2">
            <Text className="text-white text-xs font-bold">I dag</Text>
          </View>
        )}
      </View>
      {!isOpen && (
        <View className="bg-gray-200 px-2 py-0.5 rounded-full">
          <Text className="text-gray-600 text-xs font-medium">Stengt</Text>
        </View>
      )}
    </View>
  );
}
