import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Avatar from "../../../components/Avatar";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import { auth, db, getUserStudentsCollection } from "../../../config/firebaseConfig";
import theme from "../../../constants/theme";
import { getMonthlyAttendanceSummary } from "../../../utils/attendanceHelpers";

export default function StudentListScreen() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loadingStudentId, setLoadingStudentId] = useState(null);

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  const sendMonthlyReport = async (student) => {
    if (!db) {
      Alert.alert("Firebase not ready", "Please add your Firebase config values first.");
      return;
    }

    setLoadingStudentId(student.id);

    try {
      const now = new Date();
      const summary = await getMonthlyAttendanceSummary(student.id, now.getFullYear(), now.getMonth());

      if (summary.empty) {
        Alert.alert("No attendance records yet", "No attendance records available for this month yet.");
        return;
      }

      const feeStatusText = student.feeStatus === "paid" ? "Paid" : "Pending";
      const monthName = now.toLocaleString("default", { month: "long" });
      const message = `Hi! ${student.name} ki ${monthName} attendance: ${summary.presentCount}/${summary.totalMarked} din (${summary.percentage}%). Fee status: ${feeStatusText}. Fee amount: ₹${student.feeAmount}. — TuitionApp`;
      const phone = (student.parentPhone || "").replace(/[^\d]/g, "");

      if (!phone) {
        Alert.alert("Missing number", "Add parent phone number for this student first.");
        return;
      }

      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Report error", error.message || "Could not generate monthly report.");
    } finally {
      setLoadingStudentId(null);
    }
  };

  const shareParentLink = (student) => {
    const phone = (student.parentPhone || "").replace(/[^\d]/g, "");
    const userId = student.ownerId || auth?.currentUser?.uid;
    const publicUrl = userId
      ? `https://your-domain.com/student-view/${student.id}?userId=${userId}`
      : `https://your-domain.com/student-view/${student.id}`;

    if (!phone) {
      Alert.alert("Missing number", "Add parent phone number for this student first.");
      return;
    }

    const message = `Hi! ${student.name} ki current month attendance aur fee status dekhne ke liye: ${publicUrl}`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("WhatsApp not found", "Install WhatsApp or share this URL manually.");
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Students" subtitle="All enrolled learners" />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No students yet. Tap the add button to start.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.studentCard}>
            <TouchableOpacity
              style={styles.cardInfo}
              onPress={() =>
                router.push({
                  pathname: "/students/add",
                  params: {
                    id: item.id,
                    name: item.name,
                    className: item.className,
                    parentPhone: item.parentPhone,
                    feeAmount: String(item.feeAmount),
                    feeStatus: item.feeStatus,
                  },
                })
              }
            >
              <View style={styles.row}>
                <Avatar name={item.name} size={42} />
                <View style={styles.studentMeta}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentDetail}>{item.className || "Class"} · ₹{item.feeAmount}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.actionColumn}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() =>
                  router.push({
                    pathname: "/students/[id]/attendance-history",
                    params: { id: item.id, name: item.name },
                  })
                }
              >
                <Text style={styles.actionText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportButton} onPress={() => sendMonthlyReport(item)}>
                <Text style={styles.actionText}>{loadingStudentId === item.id ? "Loading..." : "Report"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={() => shareParentLink(item)}>
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.badge, { backgroundColor: item.feeStatus === "paid" ? theme.colors.successSoft : theme.colors.dangerSoft }]}>
              <Ionicons
                name={item.feeStatus === "paid" ? "checkmark-circle" : "time"}
                size={12}
                color={item.feeStatus === "paid" ? theme.colors.success : theme.colors.danger}
              />
              <Text style={{ color: item.feeStatus === "paid" ? theme.colors.success : theme.colors.danger, fontWeight: "700", fontSize: 12 }}>
                {item.feeStatus === "paid" ? "Paid" : "Pending"}
              </Text>
            </View>
          </Card>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/students/add")}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral, padding: 20 },
  list: { paddingBottom: 90 },
  studentCard: { padding: 14, marginBottom: 12, borderRadius: 18 },
  row: { flexDirection: "row", alignItems: "center", flex: 1 },
  studentMeta: { marginLeft: 12, flex: 1 },
  studentName: { fontSize: 17, fontWeight: "700", color: theme.colors.textPrimary },
  studentDetail: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 3 },
  actionColumn: { marginRight: 8, gap: 6 },
  reportButton: { backgroundColor: theme.colors.primarySoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  shareButton: { backgroundColor: "#25D366", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  actionText: { color: theme.colors.textPrimary, fontSize: 11, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  empty: { textAlign: "center", color: theme.colors.textSecondary, marginTop: 40 },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.soft,
  },
});