import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-8">
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
              placeholder="din.epost@hkskole.no"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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

          <Text className="text-center text-xs text-gray-400 mt-6">
            Bruk skole-e-post og passord for å logge inn
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
