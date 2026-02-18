import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLogin } from "@/api/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const { refresh } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn e-post og passord.");
      return;
    }

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
      await refresh();
      router.replace("/(tabs)");
    } catch {
      Alert.alert(
        "Innlogging feilet",
        "Feil e-post eller passord. Prøv igjen."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        bottomOffset={20}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-8 py-8">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="self-start mb-6 p-2 -ml-2"
            accessibilityRole="button"
            accessibilityLabel="Tilbake til hovedsiden"
          >
            <Ionicons name="arrow-back" size={26} color="#1B7A3D" />
          </TouchableOpacity>

          {/* Logo area */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-brand-green items-center justify-center mb-4">
              <Ionicons name="school" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              KantinApp
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Hamar Katedralskole
            </Text>
          </View>

          {/* Form */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              E-post
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="din.epost@innlandetfylke.no"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholderTextColor="#999"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Passord
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Ditt passord"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            className={`rounded-xl py-4 items-center ${
              loginMutation.isPending ? "bg-brand-green/60" : "bg-brand-green"
            }`}
          >
            <Text className="text-white text-base font-bold">
              {loginMutation.isPending ? "Logger inn..." : "Logg inn"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/register")}
            className="mt-6 items-center"
          >
            <Text className="text-sm text-gray-500">
              Har du ikke konto?{" "}
              <Text className="text-brand-green font-semibold">
                Registrer deg
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
