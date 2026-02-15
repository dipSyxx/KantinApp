import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TagBadge, StatusBadge } from "./Badge";
import type { MenuItemSummary } from "@/api/types";

type Props = {
  item: MenuItemSummary;
};

export function MenuItemCard({ item }: Props) {
  const router = useRouter();

  const isSoldOut = item.status === "SOLD_OUT";

  return (
    <TouchableOpacity
      onPress={() => router.push(`/dish/${item.id}`)}
      activeOpacity={0.7}
      className={`flex-row items-center bg-white rounded-2xl p-3 mx-4 mb-3 shadow-sm ${
        isSoldOut ? "opacity-50" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Dish image */}
      <Image
        source={{ uri: item.dish.imageUrl ?? undefined }}
        className="w-16 h-16 rounded-xl"
        contentFit="cover"
        placeholder={require("../../assets/icon.png")}
        transition={200}
      />

      {/* Text content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-base font-bold text-gray-900 mr-2" numberOfLines={2}>
            {item.dish.title}
          </Text>
          <StatusBadge status={item.status} />
        </View>

        {/* Tags */}
        {item.dish.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-1">
            {item.dish.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </View>
        )}
      </View>

      {/* Price */}
      <View className="ml-2 items-end">
        <Text className="text-base font-bold text-gray-900">
          {item.price} kr,-
        </Text>
      </View>
    </TouchableOpacity>
  );
}
