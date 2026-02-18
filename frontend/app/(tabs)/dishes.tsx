import { useCallback } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDishes } from "@/api/hooks/useDishes";
import type { CatalogDish } from "@/api/types";
import { DishCatalogCard } from "@/components/DishCatalogCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";

export default function DishesScreen() {
  const { data, isLoading, isError, refetch } = useDishes();

  const renderItem = useCallback(
    ({ item }: { item: CatalogDish }) => <DishCatalogCard dish={item} />,
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pt-6 pb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="fast-food" size={22} color="#1B7A3D" />
          <Text className="text-2xl font-bold text-gray-900">Retter</Text>
        </View>
        <Text className="text-base text-gray-500 mt-1">
          Alle tilgjengelige retter fra publiserte menyer
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Laster retter...</Text>
        </View>
      ) : isError ? (
        <ErrorState
          message="Kunne ikke laste retter. Sjekk internettforbindelsen."
          onRetry={refetch}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="Ingen retter ennå"
          message="Ingen tilgjengelige retter ennå."
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#1B7A3D"
              colors={["#1B7A3D"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        />
      )}
    </SafeAreaView>
  );
}
