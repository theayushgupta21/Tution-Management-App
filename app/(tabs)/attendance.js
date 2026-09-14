import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import { getUserAttendanceCollection, getUserStudentsCollection } from "../../config/firebaseConfig";
import theme from "../../constants/theme";

const getTodayKey = () => new Date().toISOString().split("T")[0];

export default function AttendanceScreen() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const todayKey = getTodayKey();

  useEffect(() => {
    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const markAttendance = async (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    try {
      const attendanceRef = doc(getUserAttendanceCollection(todayKey), studentId);
      await setDoc(attendanceRef, {
        status,
        markedAt: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert("Error", "Could not save attendance: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Attendance" subtitle={todayKey} />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Add students first from the Students tab.</Text>}
        renderItem={({ item }) => {
          const status = attendance[item.id];
          return (
            <Card style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.statusButton, status === "present" && styles.presentActive]}
                  onPress={() => markAttendance(item.id, "present")}
                >
                  <View style={styles.iconButtonContent}>
                    <Ionicons name="checkmark" size={16} color={status === "present" ? "#fff" : theme.colors.success} />
                    <Text style={status === "present" ? styles.activeText : styles.inactiveText}>Present</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === "absent" && styles.absentActive]}
                  onPress={() => markAttendance(item.id, "absent")}
                >
                  <View style={styles.iconButtonContent}>
                    <Ionicons name="close" size={16} color={status === "absent" ? "#fff" : theme.colors.danger} />
                    <Text style={status === "absent" ? styles.activeText : styles.inactiveText}>Absent</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral, padding: 20 },
  list: { paddingBottom: 30 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.textPrimary },
  buttonRow: { flexDirection: "row", gap: 8 },
  iconButtonContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
  presentActive: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
  absentActive: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
  activeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  inactiveText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: "600" },
  empty: { textAlign: "center", color: theme.colors.textSecondary, marginTop: 40 },
});