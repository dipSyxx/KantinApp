import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
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
            name="login"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
