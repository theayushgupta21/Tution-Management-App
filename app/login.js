import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import RoundedInput from "../components/RoundedInput";
import WavyBackground from "../components/WavyBackground";
import { auth, db } from "../config/firebaseConfig";
import theme from "../constants/theme";

const subjectOptions = [
  "All Subjects",
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
  "Other",
];

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [customSubject, setCustomSubject] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return (
      <View style={styles.container}>
        <WavyBackground />
        <Text style={styles.title}>Firebase setup required</Text>
        <Text style={styles.subtitle}>Add your valid Firebase credentials and restart the app.</Text>
      </View>
    );
  }

  const finalSubject = subject === "Other" ? customSubject.trim() : subject;

  const handleAuth = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (isSignup) {
      if (!trimmedName) {
        Alert.alert("Error", "Please enter your name.");
        return;
      }

      if (!finalSubject) {
        Alert.alert("Error", "Please select or type a subject.");
        return;
      }
    }

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Please fill in both fields with valid values");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: trimmedName,
          subject: finalSubject,
          email: trimmedEmail,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      Alert.alert("Authentication Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <WavyBackground />

      <View style={styles.card}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}><Ionicons name="school" size={22} color={theme.colors.primary} /></View>
          <Text style={styles.title}>Tuition Manager</Text>
        </View>
        <Text style={styles.subtitle}>{isSignup ? "Create an admin account" : "Login to your dashboard"}</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, !isSignup && styles.toggleButtonActive]}
            onPress={() => setIsSignup(false)}
          >
            <Text style={[styles.toggleText, !isSignup && styles.toggleTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, isSignup && styles.toggleButtonActive]}
            onPress={() => setIsSignup(true)}
          >
            <Text style={[styles.toggleText, isSignup && styles.toggleTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
          {isSignup && (
            <>
              <RoundedInput
                placeholder="Full Name"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                leftIcon="person"
              />

              <View style={styles.dropdownWrapper}>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowSubjectMenu((prev) => !prev)}>
                  <View style={styles.dropdownLeft}>
                    <Ionicons name="book" size={18} color={theme.colors.textSecondary} />
                    <Text style={styles.dropdownText}>{subject}</Text>
                  </View>
                  <Text style={styles.dropdownArrow}>{showSubjectMenu ? "▴" : "▾"}</Text>
                </TouchableOpacity>

                {showSubjectMenu && (
                  <View style={styles.dropdownMenu}>
                    {subjectOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.optionItem}
                        onPress={() => {
                          setSubject(option);
                          setShowSubjectMenu(false);
                          if (option !== "Other") setCustomSubject("");
                        }}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {subject === "Other" && (
                <RoundedInput
                  placeholder="Type your subject"
                  value={customSubject}
                  onChangeText={setCustomSubject}
                  leftIcon="library"
                />
              )}
            </>
          )}

          <RoundedInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail"
          />

          <RoundedInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onPressRightIcon={() => setShowPassword((prev) => !prev)}
          />

          <PrimaryButton title={isSignup ? "Create Account" : "Login"} onPress={handleAuth} loading={loading} style={styles.primaryButton} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{isSignup ? "Already have an account?" : "New here?"}</Text>
            <TouchableOpacity onPress={() => setIsSignup((prev) => !prev)}>
              <Text style={styles.linkText}>{isSignup ? "Login" : "Create Account"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.neutral,
    position: "relative",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 30,
    padding: 22,
    borderWidth: 2,
    borderColor: "#EADCCB",
    ...theme.shadows.soft,
    zIndex: 1,
  },
  formScroll: { paddingBottom: 12 },
  title: { fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginBottom: 6, color: theme.colors.textPrimary },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 20, fontWeight: "700" },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E9D7C1",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: { color: theme.colors.textSecondary, fontWeight: "800" },
  toggleTextActive: { color: theme.colors.white },
  dropdownWrapper: { marginBottom: 14 },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: theme.colors.white,
  },
  dropdownText: { fontSize: 15, color: theme.colors.textPrimary, fontWeight: "600" },
  dropdownArrow: { fontSize: 18, color: theme.colors.primary },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    marginTop: 8,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
  },
  optionItem: { paddingHorizontal: 16, paddingVertical: 12 },
  optionText: { fontSize: 15, color: theme.colors.textPrimary },
  primaryButton: { marginTop: 8 },
  footerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 18 },
  footerText: { color: theme.colors.textSecondary, marginRight: 4, fontWeight: "600" },
  linkText: { color: theme.colors.primary, fontWeight: "800" },
});