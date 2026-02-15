import { View, Text } from "react-native";

type Props = {
  icon?: string;
  title: string;
  message: string;
};

export function EmptyState({
  icon = "📋",
  title,
  message,
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-gray-800 text-center mb-2">
        {title}
      </Text>
      <Text className="text-base text-gray-500 text-center">{message}</Text>
    </View>
  );
}
