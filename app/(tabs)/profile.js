import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../components/Avatar";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import { auth, db } from "../../config/firebaseConfig";
import theme from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
            const message = error instanceof Error ? error.message : "Could not sign out.";
            Alert.alert("Logout Error", message);
          }
        },
      },
    ]);
  };

  const displayName = userProfile?.name || "Teacher";
  const subject = userProfile?.subject || "All Subjects";
  const email = userProfile?.email || auth?.currentUser?.email || "";

  if (loading) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" subtitle="Account details" />

      <Card style={styles.profileCard}>
        <Avatar name={displayName} size={120} style={styles.avatarShadow} />
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="book" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.subject}>{subject}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={18} color={theme.colors.textSecondary} />
          <Text style={styles.email}>{email}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral,
    padding: 20,
  },
  containerCentered: {
    flex: 1,
    backgroundColor: theme.colors.neutral,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 26,
    borderRadius: 24,
  },
  avatarShadow: {
    marginBottom: 18,
    ...theme.shadows.soft,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  subject: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 15,
    width: "100%",
    maxWidth: 260,
    alignItems: "center",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
