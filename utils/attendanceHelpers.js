import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

export const getMonthKey = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

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

  return { cells, daysInMonth, firstDay };
};

export const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMonthlyAttendanceSummary = async (studentId, year, monthIndex) => {
  if (!studentId || !db) {
    return {
      presentCount: 0,
      totalMarked: 0,
      totalDays: 0,
      percentage: 0,
      records: {},
      empty: true,
    };
  }

  const { daysInMonth } = getMonthGrid(year, monthIndex);
  const monthKey = getMonthKey(year, monthIndex);
  const records = {};
  const userId = auth?.currentUser?.uid;

  // Firestore mein attendance har din ke liye alag subcollection hoti hai:
  // users/{uid}/attendance/{date}/records/{studentId}
  // Isliye loop se har date ke document ko fetch karna simple aur efficient hai.
  // Yeh collectionGroup query se zyada explicit hai aur user-scoped structure ke saath sahi kaam karta hai.
  let presentCount = 0;
  let totalMarked = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
    const primaryRef = userId
      ? doc(db, "users", userId, "attendance", dateKey, "records", studentId)
      : doc(db, "attendance", dateKey, "records", studentId);

    const fallbackRef = doc(db, "attendance", dateKey, "records", studentId);

    try {
      const snap = (await getDoc(primaryRef).catch(() => null)) || (await getDoc(fallbackRef).catch(() => null));

      if (snap && snap.exists()) {
        const value = snap.data();
        const status = value.status || "not-marked";
        records[dateKey] = { ...value, status };
        totalMarked += 1;
        if (status === "present") {
          presentCount += 1;
        }
      }
    } catch (error) {
      console.warn("Could not access attendance for:", dateKey, error);
    }
  }

  const percentage = totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  return {
    presentCount,
    totalMarked,
    totalDays: daysInMonth,
    percentage,
    records,
    empty: totalMarked === 0,
  };
};

export const getMonthLabel = (year, monthIndex) =>
  new Date(year, monthIndex, 1).toLocaleString("default", { month: "long", year: "numeric" });
