import * as Crypto from "expo-crypto";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  auth,
  db,
  getUserStudentsCollection,
} from "../../../config/firebaseConfig";
import { getMonthlyAttendanceSummary } from "../../../utils/attendanceHelpers";

const generateShareToken = async () => {
  if (typeof Crypto?.randomUUID === "function") {
    return Crypto.randomUUID();
  }

  return `token_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const getStudentDocRef = async (studentId) => {
  const userId = auth?.currentUser?.uid;
  const userScopedRef = userId
    ? doc(db, "users", userId, "students", studentId)
    : null;
  const legacyRef = doc(db, "students", studentId);

  if (userScopedRef) {
    const userSnap = await getDoc(userScopedRef);
    if (userSnap.exists()) {
      return userScopedRef;
    }
  }

  const legacySnap = await getDoc(legacyRef);
  if (legacySnap.exists()) {
    return legacyRef;
  }

  return userScopedRef || legacyRef;
};

export default function AddStudentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [name, setName] = useState(params.name || "");
  const [className, setClassName] = useState(params.className || "");
  const [parentPhone, setParentPhone] = useState(params.parentPhone || "");
  const [feeAmount, setFeeAmount] = useState(params.feeAmount || "");
  const [sendingReport, setSendingReport] = useState(false);

  const handleSave = async () => {
    if (!name || !parentPhone || !feeAmount) {
      Alert.alert(
        "Missing info",
        "Please fill name, parent phone, and fee amount",
      );
      return;
    }

    const userId = auth?.currentUser?.uid;
    const nextShareToken = isEditing
      ? String(params.shareToken || "") || (await generateShareToken())
      : await generateShareToken();
    const studentData = {
      name,
      className,
      parentPhone,
      feeAmount: Number(feeAmount),
      feeStatus: params.feeStatus || "pending",
      ownerId: userId || params.ownerId || "",
      shareToken: nextShareToken,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        const studentDocRef = await getStudentDocRef(String(params.id));
        await updateDoc(studentDocRef, studentData);
      } else {
        if (!userId) {
          Alert.alert(
            "Login required",
            "Please log in before adding a student.",
          );
          return;
        }

        await addDoc(getUserStudentsCollection(), studentData);
      }
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete student?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const studentDocRef = await getStudentDocRef(String(params.id));
          await deleteDoc(studentDocRef);
          router.back();
        },
      },
    ]);
  };

  const handleViewAttendance = () => {
    if (!params.id) {
      Alert.alert(
        "Save first",
        "Please save the student before viewing attendance history.",
      );
      return;
    }

    router.push({
      pathname: "/students/[id]/attendance-history",
      params: { id: String(params.id), name: name || "Student" },
    });
  };

  const handleSendMonthlyReport = async () => {
    if (!params.id) {
      Alert.alert(
        "Save first",
        "Please save the student before sending a monthly report.",
      );
      return;
    }

    setSendingReport(true);

    try {
      const student = {
        id: String(params.id),
        name: name || "Student",
        feeAmount: Number(feeAmount || 0),
        feeStatus: params.feeStatus || "pending",
        parentPhone,
      };

      const now = new Date();
      const summary = await getMonthlyAttendanceSummary(
        student.id,
        now.getFullYear(),
        now.getMonth(),
      );

      if (summary.empty) {
        Alert.alert(
          "No attendance records",
          "No attendance records yet this month.",
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
      const message =
        error instanceof Error
          ? error.message
          : "Could not generate monthly report.";
      Alert.alert("Report error", message);
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Edit Student" : "Add Student"}
      </Text>

      <Text style={styles.label}>Student Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Riya Sharma"
      />

      <Text style={styles.label}>Class / Batch</Text>
      <TextInput
        style={styles.input}
        value={className}
        onChangeText={setClassName}
        placeholder="e.g. Class 10 - Math"
      />

      <Text style={styles.label}>Parent's WhatsApp Number</Text>
      <TextInput
        style={styles.input}
        value={parentPhone}
        onChangeText={setParentPhone}
        placeholder="e.g. 919876543210 (with country code, no + or spaces)"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Monthly Fee (₹)</Text>
      <TextInput
        style={styles.input}
        value={feeAmount}
        onChangeText={setFeeAmount}
        placeholder="e.g. 1500"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEditing ? "Update" : "Save Student"}
        </Text>
      </TouchableOpacity>

      {isEditing && (
        <>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewAttendance}
          >
            <Text style={styles.secondaryButtonText}>
              View Attendance History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSendMonthlyReport}
            disabled={sendingReport}
          >
            <Text style={styles.secondaryButtonText}>
              {sendingReport ? "Sending report..." : "Send Monthly Report"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Student</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8ED", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#3E2723",
  },
  label: { fontSize: 13, color: "#8D6E63", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#EADCCB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#3E2723",
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#8B5E3C",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 28,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    backgroundColor: "#F4E3D2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: { color: "#3E2723", fontWeight: "600" },
  deleteButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  deleteButtonText: { color: "#C1440E", fontWeight: "600" },
});
