import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import Card from "../../components/Card";
import { auth, db } from "../../config/firebaseConfig";
import theme from "../../constants/theme";

/* ---------- Ek info row: icon tile + label + value ---------- */
function InfoRow({ icon, label, value, color, soft, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowDivider]}>
      <View style={[styles.infoIcon, { backgroundColor: soft }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= Logic (pehle jaisa hi) ================= */
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const snapshot = await getDoc(userDocRef);

        if (snapshot.exists()) {
          setUserProfile(snapshot.data());
        } else {
          setUserProfile({
            name: "Teacher",
            email: auth.currentUser.email || "",
            subject: "All Subjects",
          });
        }
      } catch (error) {
        Alert.alert("Error", error.message || "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Are you sure you want to logout?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            if (!auth) {
              router.replace("/login");
              return;
            }

            await signOut(auth);
            router.replace("/login");
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Could not sign out.";
            Alert.alert("Logout Error", message);
          }
        },
      },
    ]);
  };

  const displayName = userProfile?.name || "Teacher";
  const subject = userProfile?.subject || "All Subjects";
  const email = userProfile?.email || auth?.currentUser?.email || "";

  /* ================= UI ================= */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ---------- Upar ka rangeen band + avatar ---------- */}
      <View style={[styles.banner, { paddingTop: insets.top + 14 }]}>
        <View
          style={[
            styles.circle,
            { width: 200, height: 200, top: -70, right: -60 },
          ]}
        />
        <View
          style={[
            styles.circle,
            { width: 110, height: 110, bottom: 20, left: -30 },
          ]}
        />
        <Text style={styles.bannerTitle}>Profile</Text>
      </View>

      <Animated.View
        entering={FadeInDown.duration(450)}
        style={styles.avatarWrap}
      >
        <View style={styles.avatarRing}>
          <Avatar
            name={displayName}
            size={104}
            backgroundColor={theme.colors.secondarySoft}
            textColor={theme.colors.primaryStrong}
          />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.subjectChip}>
          <Ionicons name="book" size={13} color={theme.colors.primary} />
          <Text style={styles.subjectText}>{subject}</Text>
        </View>
      </Animated.View>

      <View style={styles.body}>
        {/* ---------- Account details ---------- */}
        <Animated.View entering={FadeInDown.delay(120).duration(450)}>
          <Text style={styles.sectionTitle}>Account details</Text>
          <Card style={styles.card}>
            <InfoRow
              icon="person"
              label="Name"
              value={displayName}
              color={theme.colors.primary}
              soft={theme.colors.primarySoft}
            />
            <InfoRow
              icon="mail"
              label="Email"
              value={email}
              color={theme.colors.secondary}
              soft={theme.colors.secondarySoft}
            />
            <InfoRow
              icon="book"
              label="Subject"
              value={subject}
              color={theme.colors.warning}
              soft={theme.colors.warningSoft}
              last
            />
          </Card>
        </Animated.View>

        {/* ---------- Shortcut ---------- */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)}>
          <Text style={styles.sectionTitle}>Shortcuts</Text>
          <Pressable
            onPress={() => router.push("/fees")}
            style={({ pressed }) => [
              styles.linkRow,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open fee status"
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: theme.colors.warningSoft },
              ]}
            >
              <Ionicons name="wallet" size={18} color={theme.colors.warning} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.linkTitle}>Fee status</Text>
              <Text style={styles.linkSub}>Reminders and payment updates</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </Animated.View>

        {/* ---------- Logout ---------- */}
        <Animated.View entering={FadeInDown.delay(280).duration(450)}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.danger}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // neeche jagah floating tab bar ke liye
  content: { paddingBottom: 120 },
  centered: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

  /* Banner */
  banner: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 78,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.6,
    marginTop: 2,
  },

  /* Avatar (banner par aadha overlap) */
  avatarWrap: { alignItems: "center", marginTop: -62, paddingHorizontal: 20 },
  avatarRing: {
    padding: 5,
    borderRadius: 70,
    backgroundColor: theme.colors.card,
    ...theme.shadows.soft,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: 14,
    maxWidth: "100%",
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
  },
  subjectText: { fontSize: 13, fontWeight: "800", color: theme.colors.primary },

  /* Body */
  body: { paddingHorizontal: 20, marginTop: 26 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },

  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginTop: 2,
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  linkSub: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  /* Logout: outline style, taaki galti se dabne par bhi bhaari na lage */
  logoutButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
  },
  logoutText: { fontSize: 16, fontWeight: "800", color: theme.colors.danger },
});
