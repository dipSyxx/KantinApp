import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function SettingsScreen() {
  const { user, isAuthenticated, logout, refresh } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logg ut", "Er du sikker på at du vil logge ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logg ut",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Innstillinger
        </Text>

        {/* User info */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm text-gray-500 font-medium mb-1">Bruker</Text>
          {isAuthenticated && user ? (
            <>
              <Text className="text-lg font-bold text-gray-900">{user.name}</Text>
              <Text className="text-sm text-gray-500">{user.email}</Text>
              <Text className="text-xs text-gray-400 mt-1">
                Rolle: {user.role === "STUDENT" ? "Elev" : user.role === "CANTEEN_ADMIN" ? "Kantine-admin" : user.role}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-gray-500">Ikke logget inn</Text>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                className="bg-brand-green px-4 py-2 rounded-full mt-3 self-start"
              >
                <Text className="text-white font-semibold">Logg inn</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* App info */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm text-gray-500 font-medium mb-1">App</Text>
          <Text className="text-base text-gray-900">KantinApp v1.0.0</Text>
          <Text className="text-sm text-gray-500">Hamar Katedralskole</Text>
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 items-center"
          >
            <Text className="text-red-600 font-semibold">Logg ut</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
