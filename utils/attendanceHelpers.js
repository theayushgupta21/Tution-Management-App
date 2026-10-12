import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

// Returns YYYY-MM format
export const getMonthKey = (year, monthIndex) => {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
};

// Creates calendar cells for the selected month
export const getMonthGrid = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return {
    cells,
    daysInMonth,
    firstDay,
  };
};

// Returns YYYY-MM-DD
export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Safely fetch one attendance document
const getAttendanceRecord = async (dateKey, studentId, userId) => {
  const documentPaths = [];

  // First check the signed-in user's attendance
  if (userId) {
    documentPaths.push([
      "users",
      userId,
      "attendance",
      dateKey,
      "records",
      studentId,
    ]);
  }

  // Fallback to the legacy/global attendance structure
  documentPaths.push(["attendance", dateKey, "records", studentId]);

  for (const path of documentPaths) {
    try {
      const attendanceRef = doc(db, ...path);
      const snapshot = await getDoc(attendanceRef);

      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (error) {
      console.warn(
        `Unable to read attendance for ${dateKey}:`,
        error?.message || error,
      );
    }
  }

  return null;
};

// Returns attendance summary for a selected month
export const getMonthlyAttendanceSummary = async (
  studentId,
  year,
  monthIndex,
) => {
  const emptySummary = {
    presentCount: 0,
    absentCount: 0,
    totalMarked: 0,
    totalDays: 0,
    percentage: 0,
    records: {},
    empty: true,
  };

  if (!studentId || !db) {
    return emptySummary;
  }

  const { daysInMonth } = getMonthGrid(year, monthIndex);
  const monthKey = getMonthKey(year, monthIndex);
  const userId = auth?.currentUser?.uid;

  const records = {};

  let presentCount = 0;
  let absentCount = 0;
  let totalMarked = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;

    const value = await getAttendanceRecord(dateKey, studentId, userId);

    if (!value) {
      continue;
    }

    // Normalize status to lowercase for consistent comparisons
    const rawStatus = String(value.status || "")
      .trim()
      .toLowerCase();

    // Ignore documents without a recognized attendance status
    if (rawStatus !== "present" && rawStatus !== "absent") {
      continue;
    }

    records[dateKey] = {
      ...value,
      status: rawStatus,
    };

    totalMarked += 1;

    if (rawStatus === "present") {
      presentCount += 1;
    } else {
      absentCount += 1;
    }
  }

  const percentage =
    totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  return {
    presentCount,
    absentCount,
    totalMarked,
    totalDays: daysInMonth,
    percentage,
    records,
    empty: totalMarked === 0,
  };
};

// Returns month name and year
export const getMonthLabel = (year, monthIndex) => {
  return new Date(year, monthIndex, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
};
