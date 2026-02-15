import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  currentVote: number | null;
  onVote: (value: number) => void;
  disabled?: boolean;
};

const VOTE_OPTIONS = [
  { value: -1, emoji: "😞", label: "Dårlig" },
  { value: 0, emoji: "😐", label: "Ok" },
  { value: 1, emoji: "😀", label: "Veldig god" },
];

export function VoteButtons({ currentVote, onVote, disabled }: Props) {
  return (
    <View className="flex-row justify-center items-center gap-6">
      {VOTE_OPTIONS.map(({ value, emoji, label }) => {
        const isSelected = currentVote === value;

        return (
          <TouchableOpacity
            key={value}
            onPress={() => onVote(value)}
            disabled={disabled}
            className={`items-center px-4 py-3 rounded-2xl ${
              isSelected
                ? value === 1
                  ? "bg-green-100 border-2 border-green-400"
                  : value === 0
                  ? "bg-amber-100 border-2 border-amber-400"
                  : "bg-red-100 border-2 border-red-400"
                : "bg-gray-50 border-2 border-transparent"
            }`}
            activeOpacity={0.7}
          >
            <Text className={`text-4xl ${disabled ? "opacity-50" : ""}`}>
              {emoji}
            </Text>
            <Text
              className={`text-xs font-medium mt-1 ${
                isSelected ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
