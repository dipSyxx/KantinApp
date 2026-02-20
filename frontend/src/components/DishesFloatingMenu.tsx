import type { DishesViewMode } from "@/features/dishes/catalogFilters";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type DishesFloatingMenuProps = {
  activeFilterCount: number;
  viewMode: DishesViewMode;
  bottomOffset: number;
  onOpenFilters: () => void;
  onToggleView: () => void;
};

export function DishesFloatingMenu({
  activeFilterCount,
  viewMode,
  bottomOffset,
  onOpenFilters,
  onToggleView,
}: DishesFloatingMenuProps) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: bottomOffset,
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
