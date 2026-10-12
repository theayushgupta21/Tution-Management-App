import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../../../config/firebaseConfig";
import {
  getMonthGrid,
  getMonthLabel,
  getMonthlyAttendanceSummary,
} from "../../../../utils/attendanceHelpers";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceHistoryScreen() {
  const params = useLocalSearchParams();
  const studentId = String(params.id || "");
  const studentName = String(params.name || "Student");
  const [monthOffset, setMonthOffset] = useState(0);
  const [summary, setSummary] = useState({
    presentCount: 0,
    totalMarked: 0,
    totalDays: 0,
    percentage: 0,
    records: {},
    empty: true,
  });
  const [loading, setLoading] = useState(true);

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  useEffect(() => {
    const load = async () => {
      if (!studentId || !db) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const monthlySummary = await getMonthlyAttendanceSummary(
        studentId,
        year,
        monthIndex,
      );
      setSummary(monthlySummary);
      setLoading(false);
    };

    load();
  }, [studentId, year, monthIndex]);

  const { cells } = getMonthGrid(year, monthIndex);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const totalPresent = summary.presentCount;
  const totalMarked = summary.totalMarked;
  const daysInMonth =
    summary.totalDays || new Date(year, monthIndex + 1, 0).getDate();
  const monthPercent =
    totalMarked === 0 ? 0 : Math.round((totalPresent / totalMarked) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance History</Text>
      <Text style={styles.studentName}>{studentName}</Text>

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMonthOffset((prev) => prev - 1)}
        >
          <Text style={styles.navText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{getMonthLabel(year, monthIndex)}</Text>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setMonthOffset((prev) => prev + 1)}
        >
          <Text style={styles.navText}>→</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading attendance...</Text>
      ) : (
        <>
          <Text style={styles.summaryText}>
            This month: {totalPresent}/{daysInMonth} days present (
            {monthPercent}%)
          </Text>

          <View style={styles.calendarWrap}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekdayHeader}>
                {day}
              </Text>
            ))}

            {cells.map((day, index) => {
              if (day === null) {
                return (
                  <View key={`empty-${index}`} style={styles.dayCellEmpty} />
                );
              }

              const dayKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const record = summary.records[dayKey];
              const status = record?.status || "not-marked";
              const isToday = dayKey === todayKey;

              let cellStyle = styles.dayCellNeutral;
              if (status === "present") cellStyle = styles.dayCellPresent;
              if (status === "absent") cellStyle = styles.dayCellAbsent;
              if (isToday)
                cellStyle = {
                  ...cellStyle,
                  borderColor: "#8B5E3C",
                  borderWidth: 2,
                };

              return (
                <View key={dayKey} style={cellStyle}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 10 },
  studentName: { fontSize: 15, color: "#666", marginBottom: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  navButton: {
    backgroundColor: "#F4E3D2",
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 22, color: "#8B5E3C", fontWeight: "700" },
  monthText: { fontSize: 18, fontWeight: "700", color: "#3E2723" },
  summaryText: { fontSize: 14, color: "#3E2723", marginBottom: 18 },
  loading: { color: "#8D6E63", fontSize: 15 },
  calendarWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    borderRadius: 12,
    paddingTop: 8,
  },
  weekdayHeader: {
    width: "13.5%",
    textAlign: "center",
    color: "#8D6E63",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  dayCellNeutral: {
    width: "13.5%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayCellPresent: {
    width: "13.5%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#bbf7d0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayCellAbsent: {
    width: "13.5%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#fecaca",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  dayCellEmpty: {
    width: "13.5%",
    aspectRatio: 1,
    marginBottom: 6,
  },
  dayText: { color: "#3E2723", fontSize: 12, fontWeight: "600" },
});
