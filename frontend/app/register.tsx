import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRegister, useVerify } from "@/api/hooks/useRegister";
import { useAuth } from "@/context/AuthContext";

const ALLOWED_DOMAIN = "@innlandetfylke.no";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

type Step = "form" | "otp";

export default function RegisterScreen() {
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  // OTP fields
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const registerMutation = useRegister();
  const verifyMutation = useVerify();
  const { refresh } = useAuth();
  const router = useRouter();

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // ─── Step 1: Register ──────────────────────────────────
  const handleRegister = async () => {
    setFormError("");

    if (!name.trim()) {
      setFormError("Fyll inn navnet ditt.");
      return;
    }
    if (name.trim().length < 2) {
      setFormError("Navn må være minst 2 tegn.");
      return;
    }
    if (!email.trim()) {
      setFormError("Fyll inn e-postadressen din.");
      return;
    }
    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      setFormError(`E-post må slutte med ${ALLOWED_DOMAIN}`);
      return;
    }
    if (password.length < 8) {
      setFormError("Passord må være minst 8 tegn.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passordene stemmer ikke overens.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setResendTimer(RESEND_COOLDOWN);
      setStep("otp");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Noe gikk galt. Prøv igjen.";
      setFormError(message);
    }
  };

  // ─── Step 2: Verify OTP ────────────────────────────────
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      // Only accept digits
      const digit = value.replace(/[^0-9]/g, "").slice(-1);

      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = digit;
        return next;
      });

      // Auto-advance to next field
      if (digit && index < OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    []
  );

  const handleOtpKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === "Backspace" && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits]
  );

  const handleVerify = async () => {
    setOtpError("");
    const code = otpDigits.join("");

    if (code.length !== OTP_LENGTH) {
      setOtpError("Fyll inn hele koden.");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        code,
      });
      await refresh();
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Feil kode. Prøv igjen.";
      setOtpError(message);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtpError("");

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setResendTimer(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      Alert.alert("Sendt!", "En ny kode er sendt til e-posten din.");
    } catch {
      setOtpError("Kunne ikke sende ny kode. Prøv igjen.");
    }
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8">
            {/* Logo */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-brand-green items-center justify-center mb-4">
                <Ionicons name="school" size={40} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {step === "form" ? "Opprett konto" : "Bekreft e-post"}
              </Text>
              <Text className="text-base text-gray-500 mt-1 text-center">
                {step === "form"
                  ? "Hamar Katedralskole"
                  : `Vi sendte en kode til ${email}`}
              </Text>
            </View>

            {step === "form" ? (
              /* ─── Registration Form ─── */
              <View>
                {/* Name */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Fullt navn
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Ola Nordmann"
                    autoCapitalize="words"
                    autoComplete="name"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Email */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Skole-e-post
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={`fornavn.etternavn${ALLOWED_DOMAIN}`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholderTextColor="#999"
                  />
                  <Text className="text-xs text-gray-400 mt-1">
                    Kun {ALLOWED_DOMAIN} adresser
                  </Text>
                </View>

                {/* Password */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Passord
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minst 8 tegn"
                    secureTextEntry
                    autoComplete="new-password"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Confirm Password */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Bekreft passord
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Gjenta passordet"
                    secureTextEntry
                    autoComplete="new-password"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Error */}
                {formError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <Text className="text-red-600 text-sm">{formError}</Text>
                  </View>
                ) : null}

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={registerMutation.isPending}
                  className={`rounded-xl py-4 items-center ${
                    registerMutation.isPending
                      ? "bg-brand-green/60"
                      : "bg-brand-green"
                  }`}
                >
                  <Text className="text-white text-base font-bold">
                    {registerMutation.isPending
                      ? "Sender kode..."
                      : "Opprett konto"}
                  </Text>
                </TouchableOpacity>

                {/* Link to login */}
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mt-5 items-center"
                >
                  <Text className="text-sm text-gray-500">
                    Har du allerede konto?{" "}
                    <Text className="text-brand-green font-semibold">
                      Logg inn
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* ─── OTP Verification ─── */
              <View>
                {/* OTP icon */}
                <View className="items-center mb-6">
                  <Ionicons name="mail-outline" size={48} color="#1B7A3D" />
                </View>

                {/* OTP input boxes */}
                <View className="flex-row justify-center gap-2 mb-4">
                  {otpDigits.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => {
                        otpRefs.current[i] = ref;
                      }}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(i, v)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(i, nativeEvent.key)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={{
                        width: 48,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: digit ? "#1B7A3D" : "#D1D5DB",
                        backgroundColor: digit ? "#F0FDF4" : "#F9FAFB",
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    />
                  ))}
                </View>

                {/* Error */}
                {otpError ? (
                  <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <Text className="text-red-600 text-sm text-center">
                      {otpError}
                    </Text>
                  </View>
                ) : null}

                {/* Verify button */}
                <TouchableOpacity
                  onPress={handleVerify}
                  disabled={
                    verifyMutation.isPending ||
                    otpDigits.join("").length !== OTP_LENGTH
                  }
                  className={`rounded-xl py-4 items-center ${
                    verifyMutation.isPending
                      ? "bg-brand-green/60"
                      : "bg-brand-green"
                  }`}
                >
                  <Text className="text-white text-base font-bold">
                    {verifyMutation.isPending ? "Bekrefter..." : "Bekreft"}
                  </Text>
                </TouchableOpacity>

                {/* Resend */}
                <View className="items-center mt-5">
                  <Text className="text-sm text-gray-500 mb-2">
                    Fikk du ikke koden?
                  </Text>
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendTimer > 0 || registerMutation.isPending}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        resendTimer > 0
                          ? "text-gray-400"
                          : "text-brand-green"
                      }`}
                    >
                      {resendTimer > 0
                        ? `Send på nytt om ${resendTimer}s`
                        : "Send kode på nytt"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Back to form */}
                <TouchableOpacity
                  onPress={() => {
                    setStep("form");
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                    setOtpError("");
                  }}
                  className="mt-4 items-center"
                >
                  <Text className="text-sm text-gray-500">
                    <Text className="text-brand-green font-semibold">
                      Tilbake
                    </Text>{" "}
                    til registrering
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
