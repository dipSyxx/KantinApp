import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRegister, useVerify } from "@/api/hooks/useRegister";
import { useLogin } from "@/api/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";
import { useSchools } from "@/api/hooks/useSchools";
import { BottomSheet } from "@/components/BottomSheet";
import type { SchoolInfo } from "@/api/types";

const ALLOWED_DOMAIN = "@innlandetfylke.no";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

type Step = "form" | "otp";

export default function RegisterScreen() {
  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolInfo | null>(null);
  const [schoolPickerOpen, setSchoolPickerOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolListAtTop, setSchoolListAtTop] = useState(true);
  const [formError, setFormError] = useState("");

  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const registerMutation = useRegister();
  const verifyMutation = useVerify();
  const loginMutation = useLogin();
  const { refresh } = useAuth();
  const router = useRouter();
  const { data: schools = [] } = useSchools();

  const filteredSchools = schoolSearch.trim()
    ? schools.filter((s) =>
        s.name.toLowerCase().includes(schoolSearch.toLowerCase()),
      )
    : schools;

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

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
    if (!selectedSchool) {
      setFormError("Velg skolen din.");
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
        schoolId: selectedSchool.id,
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

  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === "Backspace" && !otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpDigits],
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
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
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
    if (resendTimer > 0 || !selectedSchool) return;
    setOtpError("");

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        schoolId: selectedSchool.id,
      });
      setResendTimer(RESEND_COOLDOWN);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      Alert.alert("Sendt!", "En ny kode er sendt til e-posten din.");
    } catch {
      setOtpError("Kunne ikke sende ny kode. Prøv igjen.");
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
        <View className="px-8 py-6">
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
                ? "Innlandet fylkeskommune"
                : `Vi sendte en kode til ${email}`}
            </Text>
            {step === "otp" && (
              <Text className="text-xs text-amber-700 mt-2 text-center">
                Sjekk søppelpost (spam) hvis du ikke finner koden i innboksen.
              </Text>
            )}
          </View>

          {step === "form" ? (
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
                  returnKeyType="next"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                  placeholderTextColor="#999"
                />
              </View>

              {/* School Picker */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Velg skole
                </Text>
                <TouchableOpacity
                  onPress={() => setSchoolPickerOpen(true)}
                  className="border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex-row items-center justify-between"
                >
                  <Text
                    className={`text-base ${selectedSchool ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {selectedSchool?.name ?? "Trykk for å velge skole..."}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* School Picker Bottom Sheet */}
              <BottomSheet
                visible={schoolPickerOpen}
                enableSwipeDown={schoolListAtTop}
                onClose={() => {
                  setSchoolPickerOpen(false);
                  setSchoolSearch("");
                  setSchoolListAtTop(true);
                }}
              >
                <View className="flex-1 bg-white">
                  <View className="px-5 pt-3 pb-3 border-b border-gray-100">
                    <Text className="text-center text-xl font-bold text-gray-900 mb-3">
                      Velg skole
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-3 bg-gray-50">
                      <Ionicons name="search" size={18} color="#9CA3AF" />
                      <TextInput
                        value={schoolSearch}
                        onChangeText={setSchoolSearch}
                        placeholder="Søk etter skole..."
                        className="flex-1 px-2 py-3 text-base text-gray-900"
                        placeholderTextColor="#999"
                      />
                      {schoolSearch.length > 0 && (
                        <TouchableOpacity onPress={() => setSchoolSearch("")}>
                          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <FlatList
                    data={filteredSchools}
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                    onScroll={(e) => setSchoolListAtTop(e.nativeEvent.contentOffset.y <= 0)}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    renderItem={({ item }) => {
                      const selected = selectedSchool?.id === item.id;
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedSchool(item);
                            setSchoolPickerOpen(false);
                            setSchoolSearch("");
                          }}
                          activeOpacity={0.7}
                          className={`mx-3 mt-2 px-4 py-3.5 rounded-2xl flex-row items-center ${
                            selected ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"
                          }`}
                        >
                          <View
                            className={`w-9 h-9 rounded-full items-center justify-center ${
                              selected ? "bg-brand-green" : "bg-gray-200"
                            }`}
                          >
                            <Ionicons
                              name="school"
                              size={18}
                              color={selected ? "#FFFFFF" : "#6B7280"}
                            />
                          </View>
                          <Text
                            className={`text-base ml-3 flex-1 ${
                              selected
                                ? "text-emerald-700 font-semibold"
                                : "text-gray-900"
                            }`}
                          >
                            {item.name}
                          </Text>
                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color="#1B7A3D"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <Text className="text-gray-400 text-center py-8">
                        Ingen skoler funnet
                      </Text>
                    }
                  />
                </View>
              </BottomSheet>

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
                  returnKeyType="next"
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
                  returnKeyType="next"
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
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                  placeholderTextColor="#999"
                />
              </View>

              {formError ? (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-600 text-sm">{formError}</Text>
                </View>
              ) : null}

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
            <View>
              <View className="items-center mb-6">
                <Ionicons name="mail-outline" size={48} color="#1B7A3D" />
              </View>

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

              {otpError ? (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-600 text-base text-center">
                    {otpError}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleVerify}
                disabled={
                  verifyMutation.isPending ||
                  loginMutation.isPending ||
                  otpDigits.join("").length !== OTP_LENGTH
                }
                className={`rounded-xl py-4 items-center ${
                  verifyMutation.isPending || loginMutation.isPending
                    ? "bg-brand-green/60"
                    : "bg-brand-green"
                }`}
              >
                <Text className="text-white text-base font-bold">
                  {verifyMutation.isPending || loginMutation.isPending
                    ? "Bekrefter..."
                    : "Bekreft"}
                </Text>
              </TouchableOpacity>

              <View className="items-center mt-5">
                <Text className="text-base text-gray-500 mb-2">
                  Fikk du ikke koden?
                </Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendTimer > 0 || registerMutation.isPending}
                >
                  <Text
                    className={`text-base font-semibold ${
                      resendTimer > 0 ? "text-gray-400" : "text-brand-green"
                    }`}
                  >
                    {resendTimer > 0
                      ? `Send på nytt om ${resendTimer}s`
                      : "Send kode på nytt"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setStep("form");
                  setOtpDigits(Array(OTP_LENGTH).fill(""));
                  setOtpError("");
                }}
                className="mt-4 items-center"
              >
                <Text className="text-base text-gray-500">
                  <Text className="text-brand-green font-semibold">
                    Tilbake
                  </Text>{" "}
                  til registrering
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
