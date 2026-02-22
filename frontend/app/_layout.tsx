import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Platform, ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup =
      segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isAuthenticated, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color="#1B7A3D" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="dish/[id]"
                  options={{
                    headerShown: true,
                    headerTitle: "",
                    headerBackTitle: "Tilbake",
                    headerTintColor: "#1B7A3D",
                    presentation: "card",
                  }}
                />
                <Stack.Screen
                  name="dishes/[id]"
                  options={{
                    headerShown: true,
                    headerTitle: "",
                    headerBackTitle: "Tilbake",
                    headerTintColor: "#1B7A3D",
                    presentation: "card",
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerShown: false,
                    presentation: Platform.OS === "ios" ? "card" : "modal",
                  }}
                />
                <Stack.Screen
                  name="register"
                  options={{
                    headerShown: false,
                    presentation: Platform.OS === "ios" ? "card" : "modal",
                  }}
                />
              </Stack>
            </AuthGate>
          </AuthProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
