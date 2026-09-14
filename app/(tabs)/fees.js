import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Card from "../../components/Card";
import ScreenHeader from "../../components/ScreenHeader";
import { auth, db, getUserStudentsCollection } from "../../config/firebaseConfig";
import theme from "../../constants/theme";

const getStudentDocRef = async (studentId) => {
  const userId = auth?.currentUser?.uid;
  const userScopedRef = userId ? doc(db, "users", userId, "students", studentId) : null;
  const legacyRef = doc(db, "students", studentId);

  if (userScopedRef) {
    const userSnap = await getDoc(userScopedRef);
    if (userSnap.exists()) return userScopedRef;
  }

  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) return legacyRef;

  return userScopedRef || legacyRef;
};

export default function FeeScreen() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(getUserStudentsCollection(), (snapshot) => {
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const sendReminder = (student) => {
    const cleanPhone = (student.parentPhone || "").replace(/[^\d]/g, "");

    if (!cleanPhone) {
      Alert.alert("Missing number", "Add a valid parent phone number for this student first.");
      return;
    }

    const message = `Hello, this is a reminder that the tuition fee of ₹${student.feeAmount} for ${student.name} is still pending. Please pay at your earliest convenience. Thank you!`;
    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("WhatsApp not found", "Make sure WhatsApp is installed on this device and the parent phone number includes the country code.");
    });
  };

  const toggleFeeStatus = async (student) => {
    const studentDocRef = await getStudentDocRef(student.id);
    const newStatus = student.feeStatus === "paid" ? "pending" : "paid";
    await updateDoc(studentDocRef, { feeStatus: newStatus });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fee Status" subtitle="Collections overview" />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No students yet.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.amount}>₹{item.feeAmount} / month</Text>
              </View>

              <TouchableOpacity onPress={() => toggleFeeStatus(item)}>
                <View
                  style={[
                    styles.statusTag,
                    {
                      backgroundColor: item.feeStatus === "paid" ? theme.colors.successSoft : theme.colors.dangerSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.feeStatus === "paid" ? "checkmark-circle" : "time"}
                    size={14}
                    color={item.feeStatus === "paid" ? theme.colors.success : theme.colors.danger}
                  />
                  <Text style={{ color: item.feeStatus === "paid" ? theme.colors.success : theme.colors.danger, fontWeight: "700", fontSize: 12 }}>
                    {item.feeStatus === "paid" ? "Paid" : "Pending"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {item.feeStatus !== "paid" && (
              <TouchableOpacity style={styles.reminderButton} onPress={() => sendReminder(item)}>
                <View style={styles.reminderContent}>
                  <Ionicons name="chatbubble" size={16} color="#fff" />
                  <Text style={styles.reminderButtonText}>Remind on WhatsApp</Text>
                </View>
              </TouchableOpacity>
            )}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.neutral, padding: 20 },
  list: { paddingBottom: 32 },
  card: { marginBottom: 12, borderRadius: 18 },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 18, fontWeight: "700", color: theme.colors.textPrimary },
  amount: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  statusTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, overflow: "hidden" },
  reminderButton: { marginTop: 14, backgroundColor: "#25D366", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  reminderContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  reminderButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  empty: { textAlign: "center", color: theme.colors.textSecondary, marginTop: 40 },
});