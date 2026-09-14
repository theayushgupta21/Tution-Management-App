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
        subtitle="Your center at a glance"
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        }
      />

      <Card style={styles.heroCard}>
        <View style={styles.heroRow}>
          <TouchableOpacity onPress={() => router.push("/profile")} activeOpacity={0.8}>
            <Avatar
              name={profile.name || "Teacher"}
              size={58}
              backgroundColor={theme.colors.secondarySoft}
              textColor={theme.colors.primaryStrong}
            />
          </TouchableOpacity>

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroEyebrow}>Welcome back</Text>
            <Text style={styles.heroTitle}>Hello, {displayName} 👋</Text>
            <Text style={styles.heroSubtitle}>{profile.subject || "All Subjects"}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.cardRow}>
        <Card style={styles.metricCard}>
          <View style={styles.metricTop}>
            <View style={styles.metricIconPrimary}>
              <Ionicons name="people" size={18} color="#fff" />
            </View>
            <Text style={styles.metricValue}>{totalStudents}</Text>
          </View>
          <Text style={styles.cardLabel}>Students</Text>
        </Card>

        <Card style={[styles.metricCard, styles.metricCardDanger]}>
          <View style={styles.metricTop}>
            <View style={styles.metricIconDanger}>
              <Ionicons name="cash" size={18} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.danger }]}>{pendingFees}</Text>
          </View>
          <Text style={styles.cardLabel}>Pending fees</Text>
        </Card>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
      </View>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/students")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrapPrimary}>
            <Ionicons name="people" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navButtonText}>Manage students</Text>
            <Text style={styles.navButtonMeta}>Add, update, and review learning progress</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/attendance")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrapSecondary}>
            <Ionicons name="calendar" size={18} color={theme.colors.secondary} />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navButtonText}>Attendance</Text>
            <Text style={styles.navButtonMeta}>Track class-by-class presence</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={() => router.push("/fees")}>
        <View style={styles.navButtonInner}>
          <View style={styles.navIconWrapWarning}>
            <Ionicons name="wallet" size={18} color={theme.colors.warning} />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={styles.navButtonText}>Fee status</Text>
            <Text style={styles.navButtonMeta}>Review reminders and payment updates</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.warning} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20, paddingBottom: 32 },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F7DCD2',
  },
  logoutText: { color: theme.colors.danger, fontWeight: "800" },
  heroCard: {
    borderRadius: 28,
    marginBottom: 20,
    padding: 18,
    backgroundColor: theme.colors.secondarySoft,
    borderColor: '#DDEEE8',
  },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroTextWrap: { flex: 1, marginLeft: 12 },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: { fontSize: 26, fontWeight: "800", color: theme.colors.textPrimary, letterSpacing: -0.6 },
  heroSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, fontWeight: "700" },
  cardRow: { flexDirection: "row", marginBottom: 20 },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    borderColor: '#F2D6BF',
    marginRight: 12,
  },
  metricCardDanger: { backgroundColor: theme.colors.dangerSoft, borderColor: '#F3D2C7', marginRight: 0 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  metricIconPrimary: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  metricIconDanger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.danger,
    justifyContent: "center",
    alignItems: "center",
  },
  metricValue: { fontSize: 32, fontWeight: "800", color: theme.colors.primary },
  cardLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  sectionHeaderRow: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  navButtonInner: { flexDirection: "row", alignItems: "center", flex: 1 },
  navTextWrap: { flex: 1, marginRight: 10 },
  navIconWrapPrimary: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  navIconWrapSecondary: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.secondarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  navIconWrapWarning: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.warningSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  navButtonText: { fontSize: 16, fontWeight: "800", color: theme.colors.textPrimary },
  navButtonMeta: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, fontWeight: "600" },
});