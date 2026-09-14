import { useLocalSearchParams } from 'expo-router';
import { collectionGroup, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { db } from '../../config/firebaseConfig';

const getCurrentMonthKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function StudentPublicView() {
  const { id, userId } = useLocalSearchParams<{ id: string; userId?: string }>();
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!db || !id) {
        setLoading(false);
        return;
      }

      try {
        const studentRef = userId
          ? doc(db, 'users', userId, 'students', id)
          : doc(db, 'students', id);

        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
          const studentData = { id: studentDoc.id, ...studentDoc.data() };
          setStudent(studentData);

          const monthKey = getCurrentMonthKey();
          const recordsSnap = await getDocs(collectionGroup(db, 'records'));
          const currentMonthRecords = recordsSnap.docs.filter((recordDoc) => {
            const dateId = recordDoc.ref.parent?.parent?.id;
            const matchesStudent = recordDoc.id === id;
            const sameUserScope = userId ? recordDoc.ref.path.startsWith(`users/${userId}/`) : true;
            return matchesStudent && sameUserScope && Boolean(dateId && dateId.startsWith(monthKey));
          });

          const cleaned = currentMonthRecords.map((recordDoc) => ({
            ...recordDoc.data(),
            date: recordDoc.ref.parent?.parent?.id,
          }));

          setAttendance(cleaned);
        }
      } catch (error) {
        console.warn('Student public view error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5E3C" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Student not found</Text>
      </View>
    );
  }

  const totalDays = attendance.length;
  const presentDays = attendance.filter((item) => item.status === 'present').length;
  const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{student.name}</Text>
      <Text style={styles.subtitle}>{student.className}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Fee Status</Text>
        <Text style={styles.value}>{student.feeStatus === 'paid' ? 'Paid' : 'Pending'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current Month Attendance</Text>
        <Text style={styles.value}>{presentDays}/{totalDays} days ({percentage}%)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Attendance Details</Text>
        {attendance.length === 0 ? (
          <Text style={styles.muted}>No attendance found for this month yet.</Text>
        ) : (
          attendance.map((item, index) => (
            <View key={`${item.date}-${index}`} style={styles.row}>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.statusText}>{item.status === 'present' ? 'Present' : 'Absent'}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8ED', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8ED' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6, color: '#3E2723' },
  subtitle: { fontSize: 16, color: '#8D6E63', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { fontSize: 12, color: '#8D6E63', marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '600', color: '#3E2723' },
  muted: { color: '#8D6E63', marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EADCCB', paddingVertical: 8 },
  dateText: { fontSize: 14, color: '#3E2723' },
  statusText: { fontWeight: '600', color: '#8B5E3C' },
});
