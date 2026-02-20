import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useDishes } from "@/api/hooks/useDishes";
import type { CatalogDish } from "@/api/types";
import { DishesFilterBottomSheet } from "@/components/DishesFilterBottomSheet";
import { DishCatalogCard } from "@/components/DishCatalogCard";
import { DishesFilterBottomSheetContent } from "@/components/DishesFilterBottomSheetContent";
import { DishesFloatingMenu } from "@/components/DishesFloatingMenu";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterChip } from "@/components/FilterChip";
import {
  applyDishFilters,
  applyDishSort,
  buildActiveFilterChips,
  createDefaultDishesFilters,
  getActiveFilterCount,
  getAvailableAllergens,
  getAvailableTags,
  removeSingleFilter,
  SORT_OPTIONS,
  toggleSelection,
  type ActiveFilterChip,
  type DishesFilterState,
  type DishesViewMode,
} from "@/features/dishes/catalogFilters";

const GRID_GAP = 12;
const GRID_HORIZONTAL_PADDING = 16;
const FLOATING_MENU_VERTICAL_GAP = -32;
const FLOATING_MENU_HEIGHT = 64;
const SCROLL_TOP_THRESHOLD = 2;

export default function DishesScreen() {
  const { data, isLoading, isError, refetch } = useDishes();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width: windowWidth } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<DishesViewMode>("list");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSheetAtTop, setIsSheetAtTop] = useState(true);
  const sheetScrollOffsetRef = useRef(0);
  const [appliedFilters, setAppliedFilters] = useState<DishesFilterState>(() =>
    createDefaultDishesFilters(),
  );
  const [draftFilters, setDraftFilters] = useState<DishesFilterState>(() =>
    createDefaultDishesFilters(),
  );

  const sourceDishes = data ?? [];
  const hasSourceData = sourceDishes.length > 0;

  const availableTags = useMemo(() => getAvailableTags(sourceDishes), [sourceDishes]);
  const availableAllergens = useMemo(
    () => getAvailableAllergens(sourceDishes),
    [sourceDishes],
  );

  const filteredAndSortedData = useMemo(() => {
    const filtered = applyDishFilters(sourceDishes, appliedFilters);
    return applyDishSort(filtered, appliedFilters.sort);
  }, [appliedFilters, sourceDishes]);

  const draftPreviewCount = useMemo(() => {
    const filtered = applyDishFilters(sourceDishes, draftFilters);
    return applyDishSort(filtered, draftFilters.sort).length;
  }, [draftFilters, sourceDishes]);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(appliedFilters),
    [appliedFilters],
  );
  const selectedSortLabel = useMemo(
    () =>
      SORT_OPTIONS.find((option) => option.value === appliedFilters.sort)?.label ?? "Nyeste først",
    [appliedFilters.sort],
  );
  const activeChips = useMemo(
    () => buildActiveFilterChips(appliedFilters),
    [appliedFilters],
  );

  const floatingMenuBottomOffset = insets.bottom + FLOATING_MENU_VERTICAL_GAP;
  const listBottomPadding = tabBarHeight + insets.bottom + FLOATING_MENU_HEIGHT + 20;
  const gridItemWidth = Math.max(
    140,
    (windowWidth - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2,
  );

  const resetDraftFromApplied = useCallback(() => {
    setDraftFilters({
      ...appliedFilters,
      tags: [...appliedFilters.tags],
      allergens: [...appliedFilters.allergens],
    });
  }, [appliedFilters]);

  const handleOpenDrawer = useCallback(() => {
    resetDraftFromApplied();
    sheetScrollOffsetRef.current = 0;
    setIsSheetAtTop(true);
    setIsDrawerOpen(true);
  }, [resetDraftFromApplied]);

  const handleCloseDrawer = useCallback(() => {
    sheetScrollOffsetRef.current = 0;
    setIsSheetAtTop(true);
    setIsDrawerOpen(false);
  }, []);

  const handleApplyDrawer = useCallback(() => {
    setAppliedFilters({
      ...draftFilters,
      tags: [...draftFilters.tags],
      allergens: [...draftFilters.allergens],
    });
    handleCloseDrawer();
  }, [draftFilters, handleCloseDrawer]);

  const handleResetDraft = useCallback(() => {
    setDraftFilters(createDefaultDishesFilters());
  }, []);

  const handleClearApplied = useCallback(() => {
    setAppliedFilters(createDefaultDishesFilters());
  }, []);

  const handleRemoveChip = useCallback((chip: ActiveFilterChip) => {
    setAppliedFilters((prev) => removeSingleFilter(prev, chip));
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  }, []);

  const handleSheetScrollOffsetChange = useCallback((offsetY: number) => {
    sheetScrollOffsetRef.current = offsetY;
    const nextAtTop = offsetY <= SCROLL_TOP_THRESHOLD;
    setIsSheetAtTop((prev) => (prev === nextAtTop ? prev : nextAtTop));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CatalogDish }) => {
      if (viewMode === "grid") {
        return (
          <View style={{ width: gridItemWidth }}>
            <DishCatalogCard dish={item} variant="grid" />
          </View>
        );
      }

      return <DishCatalogCard dish={item} variant="list" />;
    },
    [gridItemWidth, viewMode],
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
      ) : !hasSourceData ? (
        <EmptyState
          icon="restaurant-outline"
          title="Ingen retter ennå"
          message="Ingen tilgjengelige retter ennå."
        />
      ) : (
        <View className="flex-1">
          <View className="px-4 pb-1 flex-row items-center justify-between">
            <Text className="text-sm text-gray-500 font-medium">
              {filteredAndSortedData.length.toLocaleString("nb-NO")} retter
            </Text>
            <Text className="text-sm text-gray-500">{selectedSortLabel}</Text>
          </View>

          {activeChips.length > 0 && (
            <View className="px-4 pt-2 pb-2 bg-gray-50 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-semibold text-gray-600">Aktive filtre</Text>
                <TouchableOpacity onPress={handleClearApplied} activeOpacity={0.7}>
                  <Text className="text-sm font-semibold text-brand-green">Nullstill</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap">
                {activeChips.map((chip) => (
                  <FilterChip
                    key={chip.id}
                    label={chip.label}
                    removable
                    onRemove={() => handleRemoveChip(chip)}
                  />
                ))}
              </View>
            </View>
          )}

          <View className="flex-1">
            <FlatList
              data={filteredAndSortedData}
              key={viewMode}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              numColumns={viewMode === "grid" ? 2 : 1}
              columnWrapperStyle={
                viewMode === "grid"
                  ? {
                      paddingHorizontal: GRID_HORIZONTAL_PADDING,
                      justifyContent: "space-between",
                      gap: GRID_GAP,
                    }
                  : undefined
              }
              ListEmptyComponent={
                <EmptyState
                  icon="search-outline"
                  title="Ingen treff"
                  message="Ingen retter matcher de valgte filtrene."
                />
              }
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={refetch}
                  tintColor="#1B7A3D"
                  colors={["#1B7A3D"]}
                />
              }
              contentContainerStyle={{
                paddingBottom: listBottomPadding,
                paddingTop: 2,
              }}
            />
          </View>

          <DishesFloatingMenu
            activeFilterCount={activeFilterCount}
            viewMode={viewMode}
            bottomOffset={floatingMenuBottomOffset}
            onOpenFilters={handleOpenDrawer}
            onToggleView={handleToggleViewMode}
          />

          <DishesFilterBottomSheet
            visible={isDrawerOpen}
            enableSwipeDown={isSheetAtTop}
            onClose={handleCloseDrawer}
          >
            <DishesFilterBottomSheetContent
              filters={draftFilters}
              availableTags={availableTags}
              availableAllergens={availableAllergens}
              previewCount={draftPreviewCount}
              onScrollOffsetChange={handleSheetScrollOffsetChange}
              onApply={handleApplyDrawer}
              onReset={handleResetDraft}
              onSetSort={(sort) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  sort,
                }))
              }
              onSetPriceBucket={(priceBucket) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  priceBucket,
                }))
              }
              onToggleTag={(tag) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  tags: toggleSelection(prev.tags, tag),
                }))
              }
              onToggleAllergen={(allergen) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  allergens: toggleSelection(prev.allergens, allergen),
                }))
              }
            />
          </DishesFilterBottomSheet>
        </View>
      )}
    </SafeAreaView>
  );
}
