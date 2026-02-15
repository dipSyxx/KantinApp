import { View, Text } from "react-native";
import { ALLERGEN_LABELS, TAG_LABELS } from "@/constants/allergens";

type AllergenBadgeProps = {
  allergen: string;
};

export function AllergenBadge({ allergen }: AllergenBadgeProps) {
  const label = ALLERGEN_LABELS[allergen] ?? allergen;

  return (
    <View className="bg-red-50 border border-red-200 px-2 py-0.5 rounded-full mr-1 mb-1">
      <Text className="text-red-700 text-xs font-medium">{label}</Text>
    </View>
  );
}

type TagBadgeProps = {
  tag: string;
};

export function TagBadge({ tag }: TagBadgeProps) {
  const config = TAG_LABELS[tag];
  if (!config) return null;

  return (
    <View
      className="px-2 py-0.5 rounded-full mr-1 mb-1"
      style={{ backgroundColor: config.color + "20" }}
    >
      <Text style={{ color: config.color }} className="text-xs font-semibold">
        {config.label}
      </Text>
    </View>
  );
}

type StatusBadgeProps = {
  status: "ACTIVE" | "CHANGED" | "SOLD_OUT";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "ACTIVE") return null;

  const config = {
    CHANGED: { label: "Endret", bg: "bg-amber-100", text: "text-amber-800" },
    SOLD_OUT: { label: "Utsolgt", bg: "bg-red-100", text: "text-red-800" },
  };

  const c = config[status];

  return (
    <View className={`${c.bg} px-2 py-0.5 rounded-full`}>
      <Text className={`${c.text} text-xs font-bold`}>{c.label}</Text>
    </View>
  );
}
