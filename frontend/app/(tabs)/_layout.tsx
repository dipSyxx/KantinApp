import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1B7A3D",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          borderTopColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Meny",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🍽️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Innstillinger",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
