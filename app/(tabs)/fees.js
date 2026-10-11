import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import {
  auth,
  db,
  getUserStudentsCollection,
} from "../../config/firebaseConfig";
import theme from "../../constants/theme";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
];

const getStudentDocRef = async (studentId) => {
  const userId = auth?.currentUser?.uid;
  const userScopedRef = userId
    ? doc(db, "users", userId, "students", studentId)
    : null;
  const legacyRef = doc(db, "students", studentId);

  if (userScopedRef) {
    const userSnap = await getDoc(userScopedRef);
    if (userSnap.exists()) return userScopedRef;
  }

  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) return legacyRef;

  return userScopedRef || legacyRef;
};

const amountOf = (student) => Number(student.feeAmount) || 0;
const formatINR = (value) => `₹${value.toLocaleString("en-IN")}`;
const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

export default function FeeScreen() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const summary = useMemo(() => {
    const total = students.reduce((sum, s) => sum + amountOf(s), 0);
    const collected = students
      .filter((s) => s.feeStatus === "paid")
      .reduce((sum, s) => sum + amountOf(s), 0);
    const pendingCount = students.filter((s) => s.feeStatus !== "paid").length;
    const progress = total > 0 ? collected / total : 0;
    return {
      total,
      collected,
      pending: total - collected,
      pendingCount,
      progress,
    };
  }, [students]);

  const visibleStudents = useMemo(() => {
    if (filter === "paid")
      return students.filter((s) => s.feeStatus === "paid");
    if (filter === "pending")
      return students.filter((s) => s.feeStatus !== "paid");
    return students;
  }, [students, filter]);

  const sendReminder = (student) => {
    const cleanPhone = (student.parentPhone || "").replace(/[^\d]/g, "");

    if (!cleanPhone) {
      Alert.alert(
        "Missing number",
        "Add a valid parent phone number for this student first.",
      );
      return;
    }

    const message = `Hello, this is a reminder that the tuition fee of ₹${student.feeAmount} for ${student.name} is still pending. Please pay at your earliest convenience. Thank you!`;
    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "WhatsApp not found",
        "Make sure WhatsApp is installed on this device and the parent phone number includes the country code.",
      );
    });
  };

  const toggleFeeStatus = async (student) => {
    try {
      const studentDocRef = await getStudentDocRef(student.id);
      const newStatus = student.feeStatus === "paid" ? "pending" : "paid";
      await updateDoc(studentDocRef, { feeStatus: newStatus });
    } catch (error) {
      Alert.alert(
        "Update failed",
        "Could not change the fee status. Check your connection and try again.",
      );
    }
  };

  const renderSummary = () => (
    <View style={styles.summaryWrap}>
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Collected this month</Text>
        <Text style={styles.heroValue}>{formatINR(summary.collected)}</Text>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${Math.round(summary.progress * 100)}%` },
            ]}
          />
        </View>

        <View style={styles.heroFooter}>
          <Text style={styles.heroFooterText}>
            {Math.round(summary.progress * 100)}% of {formatINR(summary.total)}
          </Text>
          <Text style={styles.heroFooterText}>
            {formatINR(summary.pending)} left
          </Text>
        </View>
      </Card>

      <View style={styles.statRow}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: theme.colors.successSoft },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.success}
          />
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {students.length - summary.pendingCount}
          </Text>
          <Text style={styles.statLabel}>Paid</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: theme.colors.dangerSoft }]}
        >
          <Ionicons name="time" size={18} color={theme.colors.danger} />
          <Text style={[styles.statValue, { color: theme.colors.danger }]}>
            {summary.pendingCount}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStudent = ({ item }) => {
    const paid = item.feeStatus === "paid";
    const tone = paid ? theme.colors.success : theme.colors.danger;
    const toneSoft = paid ? theme.colors.successSoft : theme.colors.dangerSoft;

    return (
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.avatar, { backgroundColor: toneSoft }]}>
            <Text style={[styles.avatarText, { color: tone }]}>
              {initialsOf(item.name)}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.amount}>
              {formatINR(amountOf(item))} / month
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => toggleFeeStatus(item)}
          >
            <View style={[styles.statusTag, { backgroundColor: toneSoft }]}>
              <Ionicons
                name={paid ? "checkmark-circle" : "time"}
                size={14}
                color={tone}
              />
              <Text style={[styles.statusText, { color: tone }]}>
                {paid ? "Paid" : "Pending"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {!paid && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.reminderButton}
            onPress={() => sendReminder(item)}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={styles.reminderButtonText}>Remind on WhatsApp</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fee Status" subtitle="Collections overview" />

      <FlatList
        data={visibleStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderSummary}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="wallet-outline"
              size={36}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.empty}>
              {students.length === 0
                ? "No students yet."
                : "No students in this filter."}
            </Text>
          </View>
        }
        renderItem={renderStudent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  list: { paddingBottom: 40 },

  summaryWrap: { marginBottom: 8 },
  heroCard: { borderRadius: 24, padding: 20, marginBottom: 12 },
  heroLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  heroValue: {
    fontSize: 34,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.dangerSoft,
    marginTop: 16,
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: theme.colors.success },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  heroFooterText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  statRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 18, padding: 14, gap: 4 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  chipActive: { backgroundColor: theme.colors.textPrimary },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  chipTextActive: { color: "#fff" },

  card: { marginBottom: 12, borderRadius: 20, padding: 16 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "800" },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
  amount: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 3 },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    overflow: "hidden",
  },
  statusText: { fontWeight: "700", fontSize: 12 },

  reminderButton: {
    marginTop: 14,
    backgroundColor: "#25D366",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reminderButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  emptyWrap: { alignItems: "center", marginTop: 40, gap: 10 },
  empty: { textAlign: "center", color: theme.colors.textSecondary },
});
