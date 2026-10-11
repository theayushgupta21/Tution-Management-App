import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../../components/Avatar";
import Card from "../../../components/Card";
import ScreenHeader from "../../../components/ScreenHeader";
import {
  auth,
  db,
  getUserStudentsCollection,
} from "../../../config/firebaseConfig";
import theme from "../../../constants/theme";
import { getMonthlyAttendanceSummary } from "../../../utils/attendanceHelpers";

/* ================= Logic (pehle jaisa hi) ================= */
const generateShareToken = async () => {
  if (typeof Crypto?.randomUUID === "function") {
    return Crypto.randomUUID();
  }
  return `token_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const getParentShareBaseUrl = () => {
  const stored =
    process.env.EXPO_PUBLIC_PARENT_VIEW_BASE_URL ||
    "https://your-firebase-hosting-domain";
  return stored.replace(/\/$/, "");
};

const ensureStudentShareToken = async (student) => {
  if (student?.shareToken) {
    return student.shareToken;
  }

  const nextToken = await generateShareToken();
  const studentDoc = doc(
    db,
    "users",
    auth?.currentUser?.uid,
    "students",
    student.id,
  );

  try {
    await updateDoc(studentDoc, {
      shareToken: nextToken,
      updatedAt: new Date().toISOString(),
    });
    return nextToken;
  } catch (error) {
    console.warn("Could not update share token:", error);
    return nextToken;
  }
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
];

/* ---------- Chhota action button (icon + label, 44px) ---------- */
function ActionButton({ icon, label, onPress, loading, tone = "soft" }) {
  const isWhatsapp = tone === "whatsapp";
  const fg = isWhatsapp ? "#fff" : theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionBtn,
        isWhatsapp ? styles.actionWhatsapp : styles.actionSoft,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Ionicons name={icon} size={17} color={fg} />
      )}
      <Text style={[styles.actionLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export default function StudentListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState([]);
  const [loadingStudentId, setLoadingStudentId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setStudents(list);
    });

    return () => unsub();
  }, []);

  const sendMonthlyReport = async (student) => {
    if (!db) {
      Alert.alert(
        "Firebase not ready",
        "Please add your Firebase config values first.",
      );
      return;
    }

    setLoadingStudentId(student.id);

    try {
      const now = new Date();
      const summary = await getMonthlyAttendanceSummary(
        student.id,
        now.getFullYear(),
        now.getMonth(),
      );

      if (summary.empty) {
        Alert.alert(
          "No attendance records yet",
          "No attendance records available for this month yet.",
        );
        return;
      }

      const feeStatusText = student.feeStatus === "paid" ? "Paid" : "Pending";
      const monthName = now.toLocaleString("default", { month: "long" });
      const message = `Hi! ${student.name} ki ${monthName} attendance: ${summary.presentCount}/${summary.totalMarked} din (${summary.percentage}%). Fee status: ${feeStatusText}. Fee amount: ₹${student.feeAmount}. — TuitionApp`;
      const phone = (student.parentPhone || "").replace(/[^\d]/g, "");

      if (!phone) {
        Alert.alert(
          "Missing number",
          "Add parent phone number for this student first.",
        );
        return;
      }

      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Report error",
        error.message || "Could not generate monthly report.",
      );
    } finally {
      setLoadingStudentId(null);
    }
  };

  const shareParentLink = async (student) => {
    const phone = (student.parentPhone || "").replace(/[^\d]/g, "");
    if (!phone) {
      Alert.alert(
        "Missing number",
        "Add parent phone number for this student first.",
      );
      return;
    }

    try {
      const token = await ensureStudentShareToken(student);
      const publicUrl = `${getParentShareBaseUrl()}/parent.html?token=${encodeURIComponent(token)}`;
      const message = `Hi! ${student.name} ki attendance aur fee status dekhne ke liye yeh link open karein:\n\n${publicUrl}`;
      const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Share error",
        error.message || "Could not open WhatsApp share flow.",
      );
    }
  };

  const openEdit = (item) =>
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
    });

  /* ================= UI helpers ================= */
  const counts = useMemo(() => {
    const paid = students.filter((s) => s.feeStatus === "paid").length;
    return { all: students.length, paid, pending: students.length - paid };
  }, [students]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const isPaid = s.feeStatus === "paid";
      if (filter === "paid" && !isPaid) return false;
      if (filter === "pending" && isPaid) return false;
      if (!q) return true;
      return (
        (s.name || "").toLowerCase().includes(q) ||
        (s.className || "").toLowerCase().includes(q)
      );
    });
  }, [students, query, filter]);

  const fabBottom = Math.max(insets.bottom, 12) + 68 + 16; // floating tab bar ke upar

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Students"
              subtitle={`${counts.all} enrolled learners`}
            />

            {/* Search */}
            <View style={styles.search}>
              <Ionicons
                name="search"
                size={18}
                color={theme.colors.textSecondary}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or class"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              )}
            </View>

            {/* Filter chips */}
            <View style={styles.chipRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {f.label} · {counts[f.key]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={
                  students.length === 0 ? "people-outline" : "search-outline"
                }
                size={30}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {students.length === 0 ? "No students yet" : "No matches found"}
            </Text>
            <Text style={styles.empty}>
              {students.length === 0
                ? "Tap the + button to add your first student."
                : "Try a different name or change the filter."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const paid = item.feeStatus === "paid";
          const badgeFg = paid ? theme.colors.success : theme.colors.danger;
          const badgeBg = paid
            ? theme.colors.successSoft
            : theme.colors.dangerSoft;

          return (
            <Card style={styles.studentCard}>
              {/* Upar ka hissa: tap karne par edit */}
              <Pressable
                onPress={() => openEdit(item)}
                style={({ pressed }) => [
                  styles.cardTop,
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${item.name}`}
              >
                <Avatar name={item.name} size={46} />
                <View style={styles.studentMeta}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.studentDetail} numberOfLines={1}>
                    {item.className || "Class"} · ₹{item.feeAmount}
                  </Text>
                </View>

                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                  <Ionicons
                    name={paid ? "checkmark-circle" : "time"}
                    size={13}
                    color={badgeFg}
                  />
                  <Text style={[styles.badgeText, { color: badgeFg }]}>
                    {paid ? "Paid" : "Pending"}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.divider} />

              {/* Neeche: 3 barabar ke action buttons */}
              <View style={styles.actionRow}>
                <ActionButton
                  icon="calendar"
                  label="History"
                  onPress={() =>
                    router.push({
                      pathname: "/students/[id]/attendance-history",
                      params: { id: item.id, name: item.name },
                    })
                  }
                />
                <ActionButton
                  icon="document-text"
                  label="Report"
                  loading={loadingStudentId === item.id}
                  onPress={() => sendMonthlyReport(item)}
                />
                <ActionButton
                  icon="logo-whatsapp"
                  label="Share"
                  tone="whatsapp"
                  onPress={() => shareParentLink(item)}
                />
              </View>
            </Card>
          );
        }}
      />

      <Pressable
        onPress={() => router.push("/students/add")}
        accessibilityRole="button"
        accessibilityLabel="Add student"
        style={({ pressed }) => [
          styles.fab,
          { bottom: fabBottom },
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabText}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // neeche jagah: floating tab bar + FAB ke liye
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 190 },

  /* Search + filters */
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.textSecondary,
  },
  chipTextActive: { color: "#fff" },

  /* Card */
  studentCard: { padding: 14, marginBottom: 12, borderRadius: 22 },
  cardTop: { flexDirection: "row", alignItems: "center" },
  studentMeta: { flex: 1, marginLeft: 12, marginRight: 8 },
  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  studentDetail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 3,
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontWeight: "800", fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.6,
    marginVertical: 12,
  },

  /* Actions */
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
  },
  actionSoft: { backgroundColor: theme.colors.primarySoft },
  actionWhatsapp: { backgroundColor: "#25D366" },
  actionLabel: { fontSize: 13, fontWeight: "800" },

  /* Empty */
  emptyWrap: { alignItems: "center", marginTop: 30, paddingHorizontal: 24 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  empty: {
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },

  /* FAB */
  fab: {
    position: "absolute",
    right: 20,
    height: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.soft,
  },
  fabText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
