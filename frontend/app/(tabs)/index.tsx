import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useWeekMenu } from "@/api/hooks/useWeekMenu";
import { currentWeek, isToday } from "@/lib/week";
import { useAuth } from "@/context/AuthContext";
import { WeekSelector } from "@/components/WeekSelector";
import { MenuItemCard } from "@/components/MenuItemCard";
import { DayHeader } from "@/components/DaySection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MenuSkeleton } from "@/components/LoadingSkeleton";
import type { MenuDay, MenuItemSummary } from "@/api/types";

export default function WeekMenuScreen() {
  const { user } = useAuth();
  const cw = currentWeek();

  const [selectedYear, setSelectedYear] = useState(cw.year);
  const [selectedWeek, setSelectedWeek] = useState(cw.week);

  const { data, isLoading, isError, refetch } = useWeekMenu(
    selectedYear,
    selectedWeek
  );

  const sectionListRef = useRef<SectionList>(null);

  const handleSelectWeek = useCallback((year: number, week: number) => {
    setSelectedYear(year);
    setSelectedWeek(week);
  }, []);

  // Transform days into SectionList data
  const sections =
    data?.days?.map((day: MenuDay) => ({
      title: day.date,
      isOpen: day.isOpen,
      notes: day.notes,
      data: day.isOpen ? day.items : [],
    })) ?? [];

  // Find today's section index for auto-scroll
  const todayIndex = sections.findIndex((s: { title: string }) => isToday(s.title));

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center mb-1">
          <View className="w-10 h-10 rounded-full bg-brand-green items-center justify-center mr-3">
            <Ionicons name="school" size={22} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500 font-medium">
              Hamar Katedralskole
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mt-2">
          Velkommen{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </Text>
        <Text className="text-base text-gray-500 mt-1">
          Stem på middagene du vil ha i <Text className="font-bold">kantinen</Text>!
        </Text>
      </View>

      {/* Week selector */}
      <WeekSelector
        currentWeek={cw.week}
        currentYear={cw.year}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
        onSelectWeek={handleSelectWeek}
      />

      {/* Content */}
      {isLoading ? (
        <MenuSkeleton />
      ) : isError ? (
        <ErrorState
          message="Kunne ikke laste menyen. Sjekk internettforbindelsen."
          onRetry={refetch}
        />
      ) : sections.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="Meny ikke publisert"
          message={`Menyen for uke ${selectedWeek} er ikke publisert ennå. Sjekk tilbake senere!`}
        />
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={(item: MenuItemSummary) => item.id}
          renderSectionHeader={({ section }) => (
            <DayHeader
              date={section.title}
              isOpen={section.isOpen}
              notes={section.notes}
            />
          )}
          renderItem={({ item }: { item: MenuItemSummary }) => (
            <MenuItemCard item={item} />
          )}
          renderSectionFooter={({ section }) =>
            !section.isOpen ? (
              <View className="px-4 pb-2">
                <Text className="text-gray-400 text-sm italic">
                  Kantinen er stengt denne dagen
                </Text>
              </View>
            ) : section.data.length === 0 ? (
              <View className="px-4 pb-2">
                <Text className="text-gray-400 text-sm italic">
                  Ingen retter lagt til ennå
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#1B7A3D"
              colors={["#1B7A3D"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          stickySectionHeadersEnabled={false}
          onLayout={() => {
            // Auto-scroll to today's section
            if (todayIndex > 0 && sectionListRef.current) {
              setTimeout(() => {
                sectionListRef.current?.scrollToLocation({
                  sectionIndex: todayIndex,
                  itemIndex: 0,
                  animated: true,
                  viewOffset: 0,
                });
              }, 300);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
