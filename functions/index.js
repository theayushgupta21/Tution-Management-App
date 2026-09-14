const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const sanitizeStudent = (student) => ({
  id: student.id || null,
  name: student.name || "Student",
  className: student.className || "",
  feeStatus: student.feeStatus || "pending",
  feeAmount: typeof student.feeAmount === "number" ? student.feeAmount : null,
  updatedAt: student.updatedAt || student.createdAt || null,
});

const buildAttendanceSummary = (records) => {
  const normalized = Array.isArray(records) ? records : [];
  const totalMarked = normalized.length;
  const presentCount = normalized.filter((record) => record.status === "present").length;
  const percentage = totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  return {
    percentage,
    presentCount,
    totalMarked,
    records: normalized.slice(-5).reverse().map((record) => ({
      date: record.date,
      status: record.status === "present" ? "Present" : "Absent",
      markedAt: record.markedAt || null,
    })),
  };
};

exports.getParentView = onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = String(req.query.token || "").trim();

  if (!token) {
    res.status(400).json({
      error: "Missing token",
      message: "No student token provided in the link.",
    });
    return;
  }

  try {
    const db = admin.firestore();
    const studentsSnapshot = await db
      .collectionGroup("students")
      .where("shareToken", "==", token)
      .limit(1)
      .get();

    if (studentsSnapshot.empty) {
      res.status(404).json({
        error: "Invalid or expired link",
        message: "This parent link is invalid or no longer active.",
      });
      return;
    }

    const studentDoc = studentsSnapshot.docs[0];
    const studentData = studentDoc.data() || {};
    const ownerUid = studentDoc.ref.parent?.parent?.id;

    if (!ownerUid) {
      res.status(404).json({
        error: "Invalid or expired link",
        message: "This parent link is invalid or no longer active.",
      });
      return;
    }

    const attendanceCollectionRef = db.collection(`users/${ownerUid}/attendance`);
    const attendanceDates = await attendanceCollectionRef.listDocuments();
    const attendanceRecords = [];

    for (const dateDocRef of attendanceDates) {
      const recordDoc = await dateDocRef.collection("records").doc(studentDoc.id).get();
      if (!recordDoc.exists) {
        continue;
      }

      const payload = recordDoc.data() || {};
      attendanceRecords.push({
        date: dateDocRef.id,
        status: payload.status === "present" ? "present" : "absent",
        markedAt: payload.markedAt || null,
      });
    }

    const attendanceSummary = buildAttendanceSummary(attendanceRecords);

    const response = {
      student: sanitizeStudent({
        ...studentData,
        id: studentDoc.id,
      }),
      attendance: attendanceSummary,
      lastUpdated: studentData.updatedAt || studentData.createdAt || null,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("getParentView failed:", error);
    res.status(500).json({
      error: "Server error",
      message: "Unable to load parent data right now.",
    });
  }
});
