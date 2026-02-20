import { useDish } from "@/api/hooks/useDish";
import { AllergenBadge } from "@/components/Badge";
import { ErrorState } from "@/components/ErrorState";
import { HeroImage } from "@/components/HeroImage";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function DishCatalogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useDish(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-400">Laster...</Text>
      </View>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Kunne ikke laste rettdetaljer." onRetry={refetch} />;
  }

  const { title, description, imageUrl, allergens, tags, latestPrice } = data;

  return (
    <ScrollView className="flex-1 bg-white">
      <View>
        <HeroImage imageUrl={imageUrl} />
      </View>

      <View className="px-5 pt-5 pb-10">
        <Text className="text-2xl font-bold text-gray-900">{title}</Text>

        <Text className="text-lg font-bold text-brand-green mt-3 mb-4">
          Pris: {latestPrice !== null ? `${latestPrice} kr` : "Ikke tilgjengelig"}
        </Text>

        {description ? (
          <Text className="text-base text-gray-600 leading-6 mb-4">{description}</Text>
        ) : (
          <Text className="text-base text-gray-400 italic mb-4">Ingen beskrivelse tilgjengelig.</Text>
        )}

        {allergens.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Allergener</Text>
            <View className="flex-row flex-wrap">
              {allergens.map((allergen) => (
                <AllergenBadge key={allergen} allergen={allergen} />
              ))}
            </View>
          </View>
        )}

        {tags.length > 0 && (
          <View className="mb-2">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Tags</Text>
            <View className="flex-row flex-wrap">
              {tags.map((tag) => (
                <View
                  key={tag}
                  className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mr-1 mb-1"
                >
                  <Text className="text-emerald-700 text-xs font-medium">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
