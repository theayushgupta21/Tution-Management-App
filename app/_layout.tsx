import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import theme from "../constants/theme";

const firebaseModule: any = require("../config/firebaseConfig");
const firebaseAuth: any = firebaseModule.auth;

const auth: Auth | null = (firebaseAuth as Auth | null) ?? null;

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setCheckingAuth(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Navigation ready hone ke baad hi redirect karo, warna Expo Router early startup
    // ke dauran state update warning deta hai.
    if (!navigationState?.key || checkingAuth) return;

    const currentSegment = segments[0];
    const isPublicRoute = currentSegment === "student-view";
    const isLoginRoute = currentSegment === "login";

    if (!user) {
      if (!isPublicRoute && !isLoginRoute) {
        router.replace("/login");
      }
      return;
    }

    if (isLoginRoute || isPublicRoute) {
      router.replace("/(tabs)");
    }
  }, [user, checkingAuth, segments, navigationState?.key, router]);

  if (checkingAuth) {
    return (
      <View style={styles.loading}>
        <View style={styles.brandBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="school" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.brandName}>TuitionApp</Text>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.loader}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="student-view/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8ED",
  },
  brandBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#3E2723",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#F4E3D2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#E8A33D",
  },
  brandName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#3E2723",
    letterSpacing: -0.4,
  },
  loadingText: {
    fontSize: 13,
    color: "#8D6E63",
    marginTop: 8,
    marginBottom: 10,
    fontWeight: "600",
  },
  loader: {
    marginTop: 4,
  },
});
