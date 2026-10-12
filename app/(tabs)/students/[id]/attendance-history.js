import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { db } from "../../../../config/firebaseConfig";
import {
  getMonthGrid,
  getMonthLabel,
  getMonthlyAttendanceSummary,
} from "../../../../utils/attendanceHelpers";

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const COLORS = {
  background: "#FAF6EF",
  card: "#FFFFFF",
  brown: "#684632",
  brownDark: "#3E2B20",
  muted: "#98877B",
  border: "#EDE3D8",
  present: "#DDF3E4",
  presentText: "#247548",
  absent: "#FBE2DF",
  absentText: "#B54740",
  neutral: "#F3EEE8",
  accent: "#E8D3BD",
};

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
  const [loadError, setLoadError] = useState(false);

  const currentDate = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + monthOffset);
    return date;
  }, [monthOffset]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!studentId || !db) {
        setSummary({
          presentCount: 0,
          totalMarked: 0,
          totalDays: 0,
          percentage: 0,
          records: {},
          empty: true,
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(false);

      try {
        const result = await getMonthlyAttendanceSummary(
          studentId,
          year,
          monthIndex,
        );

        if (active) {
          setSummary(result);
        }
      } catch (error) {
        console.error("Attendance history error:", error);
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [studentId, year, monthIndex]);

  const { cells } = getMonthGrid(year, monthIndex);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const present = summary.presentCount || 0;
  const marked = summary.totalMarked || 0;
  const absent = Math.max(0, marked - present);
  const daysInMonth =
    summary.totalDays || new Date(year, monthIndex + 1, 0).getDate();

  const percentage = marked > 0 ? Math.round((present / marked) * 100) : 0;

  const canGoNext = monthOffset < 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>▦</Text>
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>STUDENT RECORDS</Text>
            <Text style={styles.title}>Attendance</Text>
          </View>

          <View style={styles.historyBadge}>
            <Text style={styles.historyBadgeText}>HISTORY</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Track attendance and monthly progress.
        </Text>

        {/* Student card */}
        <View style={styles.studentCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {studentName.trim().charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <View style={styles.studentInfo}>
            <Text style={styles.studentLabel}>ATTENDANCE FOR</Text>
            <Text style={styles.studentName} numberOfLines={1}>
              {studentName}
            </Text>
            <Text style={styles.studentSubtext}>Monthly attendance report</Text>
          </View>

          <View style={styles.studentDot} />
        </View>

        {/* Month selector */}
        <View style={styles.monthHeader}>
          <View>
            <Text style={styles.sectionLabel}>MONTHLY OVERVIEW</Text>
            <Text style={styles.monthTitle}>
              {getMonthLabel(year, monthIndex)}
            </Text>
          </View>

          <View style={styles.monthControls}>
            <TouchableOpacity
              accessibilityLabel="Previous month"
              style={styles.monthButton}
              onPress={() => setMonthOffset((prev) => prev - 1)}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="Next month"
              disabled={!canGoNext}
              style={[styles.monthButton, !canGoNext && styles.disabledButton]}
              onPress={() => setMonthOffset((prev) => prev + 1)}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  !canGoNext && styles.disabledButtonText,
                ]}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance percentage card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>ATTENDANCE RATE</Text>
              <View style={styles.percentageRow}>
                <Text style={styles.percentage}>{percentage}</Text>
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
              <Text style={styles.heroCaption}>
                {marked === 0
                  ? "No attendance marked yet"
                  : `${present} of ${marked} marked days attended`}
              </Text>
            </View>

            <View style={styles.progressCircle}>
              <Text style={styles.progressIcon}>
                {percentage >= 75 ? "↗" : "◷"}
              </Text>
              <Text style={styles.progressCircleLabel}>
                {percentage >= 75 ? "On track" : "In progress"}
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>

          <View style={styles.heroFooter}>
            <Text style={styles.heroFooterText}>Monthly progress</Text>
            <Text style={styles.heroFooterText}>
              {daysInMonth} days in month
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.present }]}
            >
              <Text style={styles.statEmoji}>✓</Text>
            </View>
            <Text style={styles.statValue}>{present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.absent }]}>
              <Text style={styles.statEmojiAbsent}>×</Text>
            </View>
            <Text style={styles.statValue}>{absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: COLORS.neutral }]}
            >
              <Text style={styles.statEmojiNeutral}>▦</Text>
            </View>
            <Text style={styles.statValue}>{marked}</Text>
            <Text style={styles.statLabel}>Marked</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeading}>
            <View>
              <Text style={styles.calendarTitle}>Attendance calendar</Text>
              <Text style={styles.calendarSubtitle}>
                Your daily attendance at a glance
              </Text>
            </View>
            <Text style={styles.calendarMonthNumber}>
              {String(monthIndex + 1).padStart(2, "0")}
            </Text>
          </View>

          <View style={styles.calendarDivider} />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.brown} />
              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          ) : loadError ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorTitle}>Couldn't load attendance</Text>
              <Text style={styles.loadingText}>
                Please check your connection and try again.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setMonthOffset((prev) => prev);
                  setLoadError(false);
                  setLoading(true);
                  getMonthlyAttendanceSummary(studentId, year, monthIndex)
                    .then(setSummary)
                    .catch((error) => {
                      console.error(error);
                      setLoadError(true);
                    })
                    .finally(() => setLoading(false));
                }}
              >
                <Text style={styles.retryButtonText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.calendarGrid}>
                {WEEK_DAYS.map((day, index) => (
                  <View key={`${day}-${index}`} style={styles.calendarCell}>
                    <Text style={styles.weekday}>{day}</Text>
                  </View>
                ))}

                {cells.map((day, index) => {
                  if (day === null) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={styles.calendarCell}
                      />
                    );
                  }

                  const dayKey = `${year}-${String(monthIndex + 1).padStart(
                    2,
                    "0",
                  )}-${String(day).padStart(2, "0")}`;

                  const record = summary.records?.[dayKey];
                  const status = record?.status || "not-marked";
                  const isToday = dayKey === todayKey;

                  const isFuture =
                    new Date(year, monthIndex, day).getTime() >
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate(),
                    ).getTime();

                  let dayStyle = styles.dayNeutral;
                  let dayTextStyle = styles.dayNumber;

                  if (status === "present") {
                    dayStyle = styles.dayPresent;
                    dayTextStyle = styles.dayNumberPresent;
                  } else if (status === "absent") {
                    dayStyle = styles.dayAbsent;
                    dayTextStyle = styles.dayNumberAbsent;
                  } else if (isFuture) {
                    dayStyle = styles.dayFuture;
                  }

                  return (
                    <View key={dayKey} style={styles.calendarCell}>
                      <View
                        style={[
                          styles.dayBox,
                          dayStyle,
                          isToday && styles.todayBox,
                        ]}
                      >
                        <Text style={dayTextStyle}>{day}</Text>
                        {status === "present" && (
                          <View style={styles.presentDot} />
                        )}
                        {status === "absent" && (
                          <View style={styles.absentDot} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.presentText },
                    ]}
                  />
                  <Text style={styles.legendText}>Present</Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: COLORS.absentText },
                    ]}
                  />
                  <Text style={styles.legendText}>Absent</Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#D6CCC2" }]}
                  />
                  <Text style={styles.legendText}>Not marked</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerIcon}>ⓘ</Text>
          <Text style={styles.footerText}>
            Attendance percentage is calculated from marked days only.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.brown,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "600",
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    color: COLORS.muted,
    marginBottom: 3,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.brownDark,
    letterSpacing: -0.8,
  },
  historyBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: COLORS.brown,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
    marginBottom: 22,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 27,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#EAD7C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  avatarText: {
    color: COLORS.brown,
    fontSize: 23,
    fontWeight: "800",
  },
  studentInfo: {
    flex: 1,
  },
  studentLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: COLORS.muted,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.brownDark,
  },
  studentSubtext: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },
  studentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#64A77B",
    marginLeft: 8,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 5,
  },
  monthTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.brownDark,
  },
  monthControls: {
    flexDirection: "row",
    gap: 8,
  },
  monthButton: {
    height: 39,
    width: 39,
    borderRadius: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    color: COLORS.brown,
    fontSize: 29,
    lineHeight: 32,
  },
  disabledButton: {
    backgroundColor: "#F0EBE5",
  },
  disabledButtonText: {
    color: "#C7BEB5",
  },
  heroCard: {
    backgroundColor: COLORS.brown,
    borderRadius: 23,
    padding: 21,
    marginBottom: 14,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  heroLabel: {
    color: "#E6D1BD",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 5,
  },
  percentage: {
    fontSize: 53,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -2,
    lineHeight: 59,
  },
  percentageSymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E6D1BD",
    marginTop: 7,
    marginLeft: 2,
  },
  heroCaption: {
    color: "#E8D8C8",
    fontSize: 11,
    marginTop: 5,
  },
  progressCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: "#A78B73",
    backgroundColor: "#76533D",
    alignItems: "center",
    justifyContent: "center",
  },
  progressIcon: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },
  progressCircleLabel: {
    color: "#E8D8C8",
    fontSize: 9,
    marginTop: 1,
  },
  progressTrack: {
    height: 7,
    borderRadius: 10,
    backgroundColor: "#8C6C53",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F1D6B7",
    borderRadius: 10,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  heroFooterText: {
    fontSize: 10,
    color: "#E8D8C8",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 17,
    paddingVertical: 15,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 18,
    color: COLORS.presentText,
    fontWeight: "800",
  },
  statEmojiAbsent: {
    fontSize: 20,
    color: COLORS.absentText,
    fontWeight: "700",
  },
  statEmojiNeutral: {
    fontSize: 16,
    color: COLORS.brown,
  },
  statValue: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.brownDark,
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  calendarCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.brownDark,
  },
  calendarSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },
  calendarMonthNumber: {
    fontSize: 29,
    fontWeight: "800",
    color: "#E6D5C4",
  },
  calendarDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 14,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    marginBottom: 8,
  },
  weekday: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.muted,
    paddingVertical: 8,
  },
  dayBox: {
    width: "88%",
    aspectRatio: 0.88,
    maxWidth: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayNeutral: {
    backgroundColor: COLORS.neutral,
  },
  dayPresent: {
    backgroundColor: COLORS.present,
  },
  dayAbsent: {
    backgroundColor: COLORS.absent,
  },
  dayFuture: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1EAE3",
  },
  todayBox: {
    borderColor: COLORS.brown,
    borderWidth: 2,
  },
  dayNumber: {
    color: "#6E6258",
    fontSize: 12,
    fontWeight: "600",
  },
  dayNumberPresent: {
    color: COLORS.presentText,
    fontSize: 12,
    fontWeight: "800",
  },
  dayNumberAbsent: {
    color: COLORS.absentText,
    fontSize: 12,
    fontWeight: "800",
  },
  presentDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.presentText,
  },
  absentDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.absentText,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 17,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  loadingContainer: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
  errorTitle: {
    color: COLORS.brownDark,
    fontSize: 15,
    fontWeight: "800",
  },
  retryButton: {
    backgroundColor: COLORS.brown,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  footerIcon: {
    color: COLORS.brown,
    fontSize: 15,
  },
  footerText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 16,
  },
});
