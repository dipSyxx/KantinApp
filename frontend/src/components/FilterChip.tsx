import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type FilterChipProps = {
  label: string;
  selected?: boolean;
  removable?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
};

export function FilterChip({
  label,
  selected = false,
  removable = false,
  onPress,
  onRemove,
}: FilterChipProps) {
  const handlePress = onPress ?? onRemove;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      className={`mr-2 mb-2 rounded-full border px-3 py-2 flex-row items-center ${
        selected ? "bg-brand-green border-brand-green" : "bg-white border-gray-200"
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? "text-white" : "text-gray-700"}`}>
        {label}
      </Text>

      {removable && (
        <View className="ml-1.5">
          <Ionicons
            name="close"
            size={14}
            color={selected ? "#FFFFFF" : "#6B7280"}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
