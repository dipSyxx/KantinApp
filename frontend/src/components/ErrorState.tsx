import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Noe gikk galt. Prøv igjen.",
  onRetry,
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name="cloud-offline-outline" size={56} color="#9CA3AF" />
      <Text className="text-lg font-bold text-gray-800 text-center mb-2 mt-4">
        Oops!
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        {message}
      </Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-brand-green px-6 py-3 rounded-full flex-row items-center gap-2"
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold">Prøv igjen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
