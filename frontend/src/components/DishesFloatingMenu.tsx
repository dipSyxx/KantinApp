import type { DishesViewMode } from "@/features/dishes/catalogFilters";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type DishesFloatingMenuProps = {
  activeFilterCount: number;
  viewMode: DishesViewMode;
  tabBarHeight: number;
  bottomInset: number;
  onOpenFilters: () => void;
  onToggleView: () => void;
};

const TAB_BAR_BASE_HEIGHT = 49;
const FLOATING_MENU_GAP_RATIO = 0.16;
const FLOATING_MENU_MIN_GAP = 10;
const FLOATING_MENU_MAX_GAP = 16;

export function DishesFloatingMenu({
  activeFilterCount,
  viewMode,
  tabBarHeight,
  bottomInset,
  onOpenFilters,
  onToggleView,
}: DishesFloatingMenuProps) {
  const tabBarContentHeight = Math.max(TAB_BAR_BASE_HEIGHT, tabBarHeight - bottomInset);
  const gapFromTabBar = Math.min(
    FLOATING_MENU_MAX_GAP,
    Math.max(
      FLOATING_MENU_MIN_GAP,
      Math.round(tabBarContentHeight * FLOATING_MENU_GAP_RATIO),
    ),
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // Keep a stable visual gap above BottomTabBar across devices.
        bottom: gapFromTabBar,
        zIndex: 50,
        alignItems: "center",
      }}
    >
      <View
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onOpenFilters}
            activeOpacity={0.8}
            className={`px-5 py-3.5 flex-row items-center ${
              activeFilterCount > 0 ? "bg-emerald-50" : "bg-white"
            }`}
          >
            <View>
              <Ionicons
                name="options-outline"
                size={20}
                color={activeFilterCount > 0 ? "#1B7A3D" : "#4B5563"}
              />

              {activeFilterCount > 0 && (
                <View
                  className="absolute -top-2 -right-2 px-1 rounded-full bg-brand-green items-center justify-center"
                  style={{ minWidth: 20, height: 20 }}
                >
                  <Text className="text-white text-xs font-bold">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </View>
            <Text className="ml-2 text-sm font-semibold text-gray-700">Filter</Text>
          </TouchableOpacity>

          <View className="w-px self-stretch bg-gray-200" />

          <TouchableOpacity
            onPress={onToggleView}
            activeOpacity={0.8}
            className={`px-5 py-3.5 flex-row items-center ${
              viewMode === "grid" ? "bg-emerald-50" : "bg-white"
            }`}
          >
            <Ionicons
              name={viewMode === "list" ? "list-outline" : "grid-outline"}
              size={20}
              color={viewMode === "grid" ? "#1B7A3D" : "#4B5563"}
            />
            <Text className="ml-2 text-sm font-semibold text-gray-700">
              {viewMode === "list" ? "Liste" : "Grid"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
