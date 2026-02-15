import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";

type Props = {
  icon?: ComponentProps<typeof Ionicons>["name"];
  iconNode?: ReactNode;
  title: string;
  message: string;
};

export function EmptyState({
  icon = "document-text-outline",
  iconNode,
  title,
  message,
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="mb-4">
        {iconNode ?? <Ionicons name={icon} size={56} color="#9CA3AF" />}
      </View>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">
        {title}
      </Text>
      <Text className="text-base text-gray-500 text-center">{message}</Text>
    </View>
  );
}
