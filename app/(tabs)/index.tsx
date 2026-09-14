import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../components/Avatar";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import theme from "../../constants/theme";

const firebaseModule: any = require("../../config/firebaseConfig");
const firebaseAuth: any = firebaseModule.auth;
const firestoreDb: any = firebaseModule.db;
const getUserStudentsCollection: any = firebaseModule.getUserStudentsCollection;

const authInstance: any = firebaseAuth ?? getAuth();

export default function DashboardScreen() {
  const router = useRouter();
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [profile, setProfile] = useState({ name: "", subject: "All Subjects", email: "" });

  useEffect(() => {
    const studentCollection = getUserStudentsCollection();
    if (!studentCollection) {
      setTotalStudents(0);
      setPendingFees(0);
      return;
    }

    const unsub = onSnapshot(studentCollection, (snapshot: any) => {
      setTotalStudents(snapshot.size);
      const pending = snapshot.docs.filter((doc: any) => doc.data().feeStatus === "pending").length;
      setPendingFees(pending);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authInstance?.currentUser) {
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestoreDb, "users", authInstance.currentUser.uid));
        if (userDoc.exists()) {
          setProfile({
            name: userDoc.data().name || "Teacher",
            subject: userDoc.data().subject || "All Subjects",
            email: userDoc.data().email || authInstance.currentUser.email || "",
          });
        } else {
          setProfile({
            name: "Teacher",
            subject: "All Subjects",
            email: authInstance.currentUser.email || "",
          });
        }
      } catch (error) {
        console.warn("Could not fetch profile:", error);
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
            await signOut(authInstance);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Could not sign out.";
            Alert.alert("Logout Error", message);
          }
        },
      },
    ]);
  };

  const displayName = profile.name || "there";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Dashboard"
        subtitle="Overview"
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <Card style={styles.greetingCard}>
        <View style={styles.greetingRow}>
          <TouchableOpacity onPress={() => router.push("/profile")} activeOpacity={0.8}>
            <Avatar name={profile.name || "Teacher"} size={56} />
          </TouchableOpacity>
          <View style={styles.greetingTextWrap}>
            <Text style={styles.greetingTitle}>Hello, {displayName} 👋</Text>
            <Text style={styles.greetingSubtitle}>{profile.subject || "All Subjects"}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.cardRow}>
        <Card style={styles.metricCard}>
          <View style={styles.metricTop}>
            <View style={styles.metricIconPrimary}><Ionicons name="people" size={18} color="#fff" /></View>
            <Text style={styles.metricValue}>{totalStudents}</Text>
          </View>
          <Text style={styles.cardLabel}>Total Students</Text>
        </Card>

        <Card style={[styles.metricCard, styles.metricCardDanger]}>
          <View style={styles.metricTop}>
            <View style={styles.metricIconDanger}><Ionicons name="cash" size={18} color="#fff" /></View>
            <Text style={[styles.metricValue, { color: theme.colors.danger }]}>{pendingFees}</Text>
          </View>
          <Text style={styles.cardLabel}>Fees Pending</Text>
        </Card>
      </View>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/students")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrap}><Ionicons name="people" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.navButtonText}>Manage Students</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/attendance")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrap}><Ionicons name="calendar" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.navButtonText}>Mark Attendance</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/fees")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrap}><Ionicons name="wallet" size={18} color={theme.colors.primary} /></View>
          <Text style={styles.navButtonText}>Fee Status</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral },
  content: { padding: 20, paddingBottom: 32 },
  logoutButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: "#fee2e2" },
  logoutText: { color: theme.colors.danger, fontWeight: "700" },
  greetingCard: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 18,
    backgroundColor: theme.colors.secondarySoft,
  },
  greetingRow: { flexDirection: "row", alignItems: "center" },
  greetingTextWrap: { flex: 1, marginLeft: 12 },
  greetingTitle: { fontSize: 22, fontWeight: "800", color: theme.colors.textPrimary },
  greetingSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  cardRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  metricCard: { flex: 1, backgroundColor: theme.colors.primarySoft, borderRadius: 18, padding: 16 },
  metricCardDanger: { backgroundColor: theme.colors.dangerSoft },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  metricIconPrimary: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, justifyContent: "center", alignItems: "center" },
  metricIconDanger: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.danger, justifyContent: "center", alignItems: "center" },
  metricValue: { fontSize: 30, fontWeight: "800", color: theme.colors.primary },
  cardLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: "600" },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    ...theme.shadows.card,
  },
  navButtonInner: { flexDirection: "row", alignItems: "center" },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  navButtonText: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
});