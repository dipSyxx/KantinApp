import { View, Text } from "react-native";
import type { VoteStats as VoteStatsType } from "@/api/types";

type Props = {
  stats: VoteStatsType;
};

type BarConfig = {
  label: string;
  emoji: string;
  count: number;
  color: string;
  bgColor: string;
};

export function VoteStats({ stats }: Props) {
  const total = stats.total || 1; // Avoid division by zero

  const bars: BarConfig[] = [
    {
      label: "Veldig god",
      emoji: "😀",
      count: stats.up,
      color: "#43A047",
      bgColor: "#E8F5E9",
    },
    {
      label: "Ok",
      emoji: "😐",
      count: stats.mid,
      color: "#FFB300",
      bgColor: "#FFF8E1",
    },
    {
      label: "Dårlig",
      emoji: "😞",
      count: stats.down,
      color: "#E53935",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <View className="mt-4">
      {bars.map((bar) => {
        const percentage = Math.round((bar.count / total) * 100);

        return (
          <View key={bar.label} className="flex-row items-center mb-3">
            {/* Emoji + count */}
            <View className="flex-row items-center w-20">
              <Text className="text-lg mr-1">{bar.emoji}</Text>
              <Text className="text-sm text-gray-700 font-medium">
                {bar.count}
              </Text>
              <Text className="text-xs text-gray-400 ml-1">
                ({percentage}%)
              </Text>
            </View>

            {/* Progress bar */}
            <View
              className="flex-1 h-3 rounded-full ml-3 overflow-hidden"
              style={{ backgroundColor: bar.bgColor }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: bar.color,
                  minWidth: bar.count > 0 ? 8 : 0,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
