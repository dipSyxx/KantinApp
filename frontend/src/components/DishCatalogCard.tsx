import type { CatalogDish } from "@/api/types";
import { getTagAppearance } from "@/constants/allergens";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { TagBadge } from "./Badge";

type Props = {
  dish: CatalogDish;
  variant?: "list" | "grid";
};

const GRID_TITLE_HEIGHT = 36;
const GRID_TAG_ROW_HEIGHT = 22;
const GRID_CONTENT_HEIGHT = 84;
const GRID_MAX_VISIBLE_TAGS = 2;

export function DishCatalogCard({ dish, variant = "list" }: Props) {
  const router = useRouter();
  const isGrid = variant === "grid";
  const visibleGridTags = isGrid ? dish.tags.slice(0, GRID_MAX_VISIBLE_TAGS) : [];
  const hiddenGridTagsCount = isGrid
    ? Math.max(0, dish.tags.length - visibleGridTags.length)
    : 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/dishes/${dish.id}`)}
      activeOpacity={0.7}
      className={`bg-white rounded-2xl mb-3 shadow-sm ${
        isGrid ? "p-2.5" : "flex-row items-center p-3 mx-4"
      }`}
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
        style={
          isGrid
            ? { width: "100%", aspectRatio: 1, borderRadius: 12, marginBottom: 8 }
            : { width: 64, height: 64, borderRadius: 12 }
        }
        contentFit="cover"
        transition={200}
      />

      <View className={isGrid ? "flex-1" : "flex-1 ml-3"} style={isGrid ? { height: GRID_CONTENT_HEIGHT } : undefined}>
        <Text
          className={`font-bold text-gray-900 ${isGrid ? "text-sm" : "text-base"}`}
          numberOfLines={isGrid ? 2 : 1}
          style={isGrid ? { lineHeight: 18, height: GRID_TITLE_HEIGHT } : undefined}
        >
          {dish.title}
        </Text>

        {!isGrid && dish.description ? (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
            {dish.description}
          </Text>
        ) : null}

        {isGrid ? (
          <View style={{ height: GRID_TAG_ROW_HEIGHT, marginTop: 4, justifyContent: "center" }}>
            {visibleGridTags.length > 0 ? (
              <View
                className="flex-row items-center"
                style={{ flexWrap: "nowrap", overflow: "hidden" }}
              >
                {visibleGridTags.map((tag, index) => (
                  <GridTagBadge key={`${tag}-${index}`} tag={tag} />
                ))}
                {hiddenGridTagsCount > 0 && (
                  <View className="bg-gray-100 px-2 py-0.5 rounded-full mr-1">
                    <Text className="text-xs font-semibold text-gray-600">
                      +{hiddenGridTagsCount}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          dish.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-1">
              {dish.tags.map((tag, index) => (
                <TagBadge key={`${tag}-${index}`} tag={tag} />
              ))}
            </View>
          )
        )}

        {isGrid && (
          <Text className="text-sm font-bold text-gray-900 mt-2">
            {dish.latestPrice !== null ? `${dish.latestPrice} kr,-` : "-"}
          </Text>
        )}
      </View>

      {!isGrid && (
        <View className="ml-2 items-end">
          <Text className="text-base font-bold text-gray-900">
            {dish.latestPrice !== null ? `${dish.latestPrice} kr,-` : "-"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function GridTagBadge({ tag }: { tag: string }) {
  const { label, color, backgroundColor } = getTagAppearance(tag);

  return (
    <View
      className="px-2 py-0.5 rounded-full mr-1"
      style={{ backgroundColor }}
    >
      <Text style={{ color }} className="text-xs font-semibold" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
