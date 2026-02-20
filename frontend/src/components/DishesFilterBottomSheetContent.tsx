import { ALLERGEN_LABELS, TAG_LABELS, prettifyTagLabel } from "@/constants/allergens";
import {
  PRICE_BUCKET_OPTIONS,
  SORT_OPTIONS,
  getActiveFilterCount,
  type DishesFilterState,
  type DishesPriceBucket,
  type DishesSortOption,
} from "@/features/dishes/catalogFilters";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilterChip } from "./FilterChip";

type DishesFilterBottomSheetContentProps = {
  filters: DishesFilterState;
  availableTags: string[];
  availableAllergens: string[];
  previewCount: number;
  onScrollOffsetChange?: (offsetY: number) => void;
  onApply: () => void;
  onReset: () => void;
  onSetSort: (sort: DishesSortOption) => void;
  onSetPriceBucket: (bucket: DishesPriceBucket) => void;
  onToggleTag: (tag: string) => void;
  onToggleAllergen: (allergen: string) => void;
};

export function DishesFilterBottomSheetContent({
  filters,
  availableTags,
  availableAllergens,
  previewCount,
  onScrollOffsetChange,
  onApply,
  onReset,
  onSetSort,
  onSetPriceBucket,
  onToggleTag,
  onToggleAllergen,
}: DishesFilterBottomSheetContentProps) {
  const insets = useSafeAreaInsets();
  const displayCount = useMemo(
    () => previewCount.toLocaleString("nb-NO"),
    [previewCount],
  );
  const draftFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters],
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-5 pb-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="w-7" />
          <Text className="flex-1 text-center text-xl font-bold text-gray-900">
            Filtrer retter
          </Text>
          <TouchableOpacity
            onPress={onReset}
            activeOpacity={0.75}
            className="w-16 items-end"
          >
            <Text className="text-brand-green text-sm font-semibold">Nullstill</Text>
          </TouchableOpacity>
        </View>

        {draftFilterCount > 0 && (
          <Text className="text-xs text-gray-500 mt-1">
            {draftFilterCount} aktiv{draftFilterCount > 1 ? "e" : ""} filtre
          </Text>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => onScrollOffsetChange?.(event.nativeEvent.contentOffset.y)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
      >
        <SectionTitle title="Sorter" />
        <View className="bg-gray-50 rounded-2xl p-2 mb-4">
          {SORT_OPTIONS.map((option) => {
            const selected = filters.sort === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSetSort(option.value)}
                activeOpacity={0.75}
                className={`px-2 py-2.5 rounded-xl flex-row items-center ${
                  selected ? "bg-white" : ""
                }`}
              >
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={selected ? "#1B7A3D" : "#9CA3AF"}
                />
                <Text className="ml-2 text-base text-gray-800">{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionTitle title="Pris" />
        <View className="flex-row flex-wrap mb-4">
          {PRICE_BUCKET_OPTIONS.map((bucket) => (
            <FilterChip
              key={bucket.value}
              label={bucket.label}
              selected={filters.priceBucket === bucket.value}
              onPress={() => onSetPriceBucket(bucket.value)}
            />
          ))}
        </View>

        <SectionTitle title="Tags" />
        {availableTags.length === 0 ? (
          <Text className="text-sm text-gray-400 mb-4">Ingen tags tilgjengelig.</Text>
        ) : (
          <View className="flex-row flex-wrap mb-4">
            {availableTags.map((tag) => (
              <FilterChip
                key={tag}
                label={TAG_LABELS[tag]?.label ?? prettifyTagLabel(tag)}
                selected={filters.tags.includes(tag)}
                onPress={() => onToggleTag(tag)}
              />
            ))}
          </View>
        )}

        <SectionTitle title="Allergener" />
        {availableAllergens.length === 0 ? (
          <Text className="text-sm text-gray-400">Ingen allergener tilgjengelig.</Text>
        ) : (
          <View className="flex-row flex-wrap">
            {availableAllergens.map((allergen) => (
              <FilterChip
                key={allergen}
                label={ALLERGEN_LABELS[allergen] ?? allergen}
                selected={filters.allergens.includes(allergen)}
                onPress={() => onToggleAllergen(allergen)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        className="border-t border-gray-100 px-5 pt-3 pb-3 bg-white"
        style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      >
        <TouchableOpacity
          onPress={onApply}
          activeOpacity={0.85}
          className="bg-brand-green rounded-2xl py-3.5 items-center"
        >
          <Text className="text-white text-base font-bold">Vis {displayCount} treff</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text className="text-sm font-bold text-gray-700 mb-2">{title}</Text>;
}
