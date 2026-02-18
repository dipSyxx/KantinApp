import type { CatalogDish } from "@/api/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { TagBadge } from "./Badge";

type Props = {
  dish: CatalogDish;
};

export function DishCatalogCard({ dish }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/dishes/${dish.id}`)}
      activeOpacity={0.7}
      className="flex-row items-center bg-white rounded-2xl p-3 mx-4 mb-3 shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Image
        source={dish.imageUrl ? { uri: dish.imageUrl } : require("../../assets/icon.png")}
        style={{ width: 64, height: 64, borderRadius: 12 }}
        contentFit="cover"
        transition={200}
      />

      <View className="flex-1 ml-3">
        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
          {dish.title}
        </Text>
        {dish.description ? (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
            {dish.description}
          </Text>
        ) : null}

        {dish.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-1">
            {dish.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </View>
        )}
      </View>

      <View className="ml-2 items-end">
        <Text className="text-base font-bold text-gray-900">
          {dish.latestPrice !== null ? `${dish.latestPrice} kr,-` : "-"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
