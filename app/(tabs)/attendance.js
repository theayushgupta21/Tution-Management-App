import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Avatar from "../../components/Avatar";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import {
  getUserAttendanceCollection,
  getUserStudentsCollection,
} from "../../config/firebaseConfig";
import theme from "../../constants/theme";

// Local date (UTC nahi), taaki India mein subah ke time par kal ki date na bane
const getTodayKey = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const buzz = () => {
  if (Platform.OS !== "web") Haptics.selectionAsync();
};

/* ---------- Present / Absent button (bada touch target, 46px) ---------- */
function StatusButton({ label, icon, color, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.statusButton,
        active && { backgroundColor: color, borderColor: color },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? "#fff" : color} />
      <Text style={[styles.statusText, active && { color: "#fff" }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Summary card ---------- */
function Summary({ present, absent, unmarked, total, onAllPresent }) {
  const marked = present + absent;
  const percent = total > 0 ? Math.round((marked / total) * 100) : 0;

  return (
    <Card style={styles.summary}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryEyebrow}>Today's progress</Text>
          <Text style={styles.summaryValue}>
            {marked}
            <Text style={styles.summaryTotal}> / {total} marked</Text>
          </Text>
        </View>
        <Text style={styles.summaryPercent}>{percent}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.pillRow}>
        <View
          style={[
            styles.countPill,
            { backgroundColor: theme.colors.secondarySoft },
          ]}
        >
          <Text style={[styles.countValue, { color: theme.colors.success }]}>
            {present}
          </Text>
          <Text style={styles.countLabel}>Present</Text>
        </View>
        <View
          style={[
            styles.countPill,
            { backgroundColor: theme.colors.dangerSoft },
          ]}
        >
          <Text style={[styles.countValue, { color: theme.colors.danger }]}>
            {absent}
          </Text>
          <Text style={styles.countLabel}>Absent</Text>
        </View>
        <View
          style={[
            styles.countPill,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        >
          <Text style={[styles.countValue, { color: theme.colors.primary }]}>
            {unmarked}
          </Text>
          <Text style={styles.countLabel}>Left</Text>
        </View>
      </View>

      {total > 0 && (
        <Pressable
          onPress={onAllPresent}
          style={({ pressed }) => [
            styles.allButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons
            name="checkmark-done"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.allText}>Mark everyone present</Text>
        </Pressable>
      )}
    </Card>
  );
}

export default function AttendanceScreen() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const todayKey = getTodayKey();

  const prettyDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Students (naam ke hisaab se sorted)
  useEffect(() => {
    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setStudents(list);
    });
    return () => unsub();
  }, []);

  // Aaj ki saved attendance wapas load hoti hai (screen reopen par gayab nahi hogi)
  useEffect(() => {
    const col = getUserAttendanceCollection(todayKey);
    if (!col) return;
    const unsub = onSnapshot(col, (snapshot) => {
      const map = {};
      snapshot.docs.forEach((d) => {
        map[d.id] = d.data().status;
      });
      setAttendance(map);
    });
    return () => unsub();
  }, [todayKey]);

  const save = (studentId, status) =>
    setDoc(doc(getUserAttendanceCollection(todayKey), studentId), {
      status,
      markedAt: new Date().toISOString(),
    });

  const markAttendance = async (studentId, status) => {
    buzz();
    const previous = attendance[studentId];
    setAttendance((prev) => ({ ...prev, [studentId]: status })); // turant UI update
    try {
      await save(studentId, status);
    } catch (error) {
      setAttendance((prev) => ({ ...prev, [studentId]: previous })); // fail ho to wapas
      Alert.alert("Error", "Could not save attendance: " + error.message);
    }
  };

  const markAllPresent = () => {
    Alert.alert(
      "Mark everyone present?",
      "This will set all students as present for today.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, mark all",
          onPress: async () => {
            buzz();
            setAttendance(
              Object.fromEntries(students.map((s) => [s.id, "present"])),
            );
            try {
              await Promise.all(students.map((s) => save(s.id, "present")));
            } catch (error) {
              Alert.alert(
                "Error",
                "Could not save attendance: " + error.message,
              );
            }
          },
        },
      ],
    );
  };

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    students.forEach((s) => {
      if (attendance[s.id] === "present") present += 1;
      else if (attendance[s.id] === "absent") absent += 1;
    });
    return { present, absent, unmarked: students.length - present - absent };
  }, [students, attendance]);

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Attendance" subtitle={prettyDate} />
            <Summary
              present={counts.present}
              absent={counts.absent}
              unmarked={counts.unmarked}
              total={students.length}
              onAllPresent={markAllPresent}
            />
            {students.length > 0 && (
              <Text style={styles.sectionTitle}>Students</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={30}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No students yet</Text>
            <Text style={styles.empty}>
              Add students first from the Students tab, then come back to mark
              attendance.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = attendance[item.id];
          const statusColor =
            status === "present"
              ? theme.colors.success
              : status === "absent"
                ? theme.colors.danger
                : theme.colors.border;

          return (
            <Card style={[styles.row, { borderColor: statusColor }]}>
              <View style={styles.rowTop}>
                <Avatar
                  name={item.name || "Student"}
                  size={40}
                  backgroundColor={theme.colors.secondarySoft}
                  textColor={theme.colors.primaryStrong}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.state,
                    status === "present" && { color: theme.colors.success },
                    status === "absent" && { color: theme.colors.danger },
                  ]}
                ></Text>
              </View>

              <View style={styles.buttonRow}>
                <StatusButton
                  label="Present"
                  icon="checkmark-circle"
                  color={theme.colors.success}
                  active={status === "present"}
                  onPress={() => markAttendance(item.id, "present")}
                />
                <StatusButton
                  label="Absent"
                  icon="close-circle"
                  color={theme.colors.danger}
                  active={status === "absent"}
                  onPress={() => markAttendance(item.id, "absent")}
                />
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // paddingBottom floating tab bar ke liye
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  /* Summary */
  summary: {
    borderRadius: 26,
    padding: 18,
    marginBottom: 20,
    backgroundColor: theme.colors.card,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  summaryEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0,
  },
  summaryPercent: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.primary,
  },
  track: {
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.primarySoft,
    overflow: "hidden",
    marginBottom: 14,
  },
  fill: { height: 10, borderRadius: 6, backgroundColor: theme.colors.primary },
  pillRow: { flexDirection: "row", gap: 10 },
  countPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  countValue: { fontSize: 20, fontWeight: "800" },
  countLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  allButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
  },
  allText: { fontSize: 14, fontWeight: "800", color: theme.colors.success },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },

  /* Student row */
  row: {
    borderRadius: 25,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2.5,
  },
  rowTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginLeft: 12,
    marginRight: 8,
  },
  state: { fontSize: 12, fontWeight: "800", color: theme.colors.textSecondary },
  buttonRow: { flexDirection: "row", gap: 10 },
  statusButton: {
    flex: 1,
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },

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
});
