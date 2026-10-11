import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Avatar from "../../components/Avatar";
import theme from "../../constants/theme";

const firebaseModule: any = require("../../config/firebaseConfig");
const firebaseAuth: any = firebaseModule.auth;
const firestoreDb: any = firebaseModule.db;
const getUserStudentsCollection: any = firebaseModule.getUserStudentsCollection;

const authInstance: any = firebaseAuth ?? getAuth();

/* ================= Motion system =================
   Ek hi language poore screen par:
   - sab kuch "fade + 18px upar uthna" (koi bounce nahi)
   - ek hi easing: out-cubic
   - stagger chhota (60-80ms), total handoff ~1 second
   - splash ka fade-out aur content ka reveal OVERLAP karte hain,
     isliye beech mein koi khaali jhatka nahi aata.
==================================================== */
const SPLASH_MS = 2600; // splash kitni der dikhe
const HANDOFF_MS = 560; // splash fade-out ka time
const EASE = Easing.out(Easing.cubic);

/* ---------- Reveal: har section isi se aata hai ---------- */
function Reveal({
  children,
  delay = 0,
  go,
  style,
}: {
  children: ReactNode;
  delay?: number;
  go: boolean;
  style?: any;
}) {
  const v = useSharedValue(0);

  useEffect(() => {
    if (go)
      v.value = withDelay(
        delay,
        withTiming(1, { duration: 520, easing: EASE }),
      );
  }, [go]);

  const a = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 18 }],
  }));

  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/* ---------- Count-up: purane value se naye tak (0 se restart nahi) ---------- */
function useCountUp(target: number, start: boolean, delay = 0, duration = 800) {
  const [val, setVal] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    if (!start) return;
    let raf = 0;
    let t0: number | undefined;
    const begin = from.current;

    const timer = setTimeout(() => {
      const tick = (t: number) => {
        if (t0 === undefined) t0 = t;
        const p = Math.min((t - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(begin + (target - begin) * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
        else from.current = target;
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, start]);

  return val;
}

/* ---------- Splash pieces ---------- */
function PulseRing({ delay = 0 }: { delay?: number }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 1.1 }],
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

function FloatingBlob({
  style,
  duration = 3000,
}: {
  style: any;
  duration?: number;
}) {
  const y = useSharedValue(0);

  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-10, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(10, { duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.blob, style, anim]} />
  );
}

/* ---------- Welcome splash (design same, exit naya) ---------- */
function WelcomeSplash({ name, leaving }: { name: string; leaving: boolean }) {
  const iconScale = useSharedValue(0.4);
  const out = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 9, stiffness: 120 });
  }, []);

  useEffect(() => {
    // fade + halka sa bada hota hai, jaise camera aage badh raha ho
    if (leaving)
      out.value = withTiming(1, {
        duration: HANDOFF_MS,
        easing: Easing.inOut(Easing.cubic),
      });
  }, [leaving]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  const outStyle = useAnimatedStyle(() => ({
    opacity: 1 - out.value,
    transform: [{ scale: 1 + out.value * 0.06 }],
  }));

  return (
    <Animated.View
      pointerEvents={leaving ? "none" : "auto"}
      style={[styles.splash, outStyle]}
    >
      <FloatingBlob
        style={{ width: 220, height: 220, top: -60, right: -70 }}
        duration={3200}
      />
      <FloatingBlob
        style={{ width: 140, height: 140, bottom: 80, left: -50 }}
        duration={2600}
      />
      <FloatingBlob
        style={{ width: 40, height: 40, top: "28%", left: "18%" }}
        duration={2000}
      />

      <View style={styles.splashIconWrap}>
        <PulseRing />
        <PulseRing delay={900} />
        <Animated.View style={[styles.splashIcon, iconStyle]}>
          <Ionicons name="school" size={54} color={theme.colors.primary} />
        </Animated.View>
      </View>

      <Animated.Text
        entering={FadeInDown.delay(500).duration(500)}
        style={styles.splashEyebrow}
      >
        WELCOME TO THE TEACHER APP
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(750).duration(500)}
        style={styles.splashName}
        numberOfLines={1}
      >
        {name}
      </Animated.Text>
      <Animated.Text
        entering={FadeIn.delay(1100).duration(500)}
        style={styles.splashHint}
      >
        Setting up your dashboard…
      </Animated.Text>
    </Animated.View>
  );
}

/* ---------- Tracker bar ---------- */
function TrackerBar({
  percent,
  go,
  delay,
}: {
  percent: number;
  go: boolean;
  delay: number;
}) {
  const w = useSharedValue(0);

  useEffect(() => {
    if (go)
      w.value = withDelay(
        delay,
        withTiming(percent, { duration: 800, easing: EASE }),
      );
  }, [percent, go]);

  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

/* ---------- Action card (press feedback: scale, bina uchhal ke) ---------- */
function ActionCard({
  icon,
  title,
  subtitle,
  color,
  soft,
  onPress,
  delay,
  go,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  soft: string;
  onPress: () => void;
  delay: number;
  go: boolean;
}) {
  const s = useSharedValue(1);
  const arrow = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrow.value * 4 }],
  }));

  return (
    <Reveal go={go} delay={delay}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          s.value = withTiming(0.97, { duration: 100 });
          arrow.value = withTiming(1, { duration: 140 });
        }}
        onPressOut={() => {
          s.value = withTiming(1, { duration: 180 });
          arrow.value = withTiming(0, { duration: 180 });
        }}
      >
        <Animated.View
          style={[styles.action, { borderColor: soft }, pressStyle]}
        >
          <View style={[styles.actionAccent, { backgroundColor: color }]} />
          <View style={[styles.actionIcon, { backgroundColor: soft }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSub}>{subtitle}</Text>
          </View>
          <Animated.View
            style={[styles.actionArrow, { backgroundColor: soft }, arrowStyle]}
          >
            <Ionicons name="arrow-forward" size={16} color={color} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Reveal>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showSplash, setShowSplash] = useState(true);
  const [leaving, setLeaving] = useState(false); // splash nikalna shuru = content reveal shuru
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    subject: "All Subjects",
    email: "",
  });

  // Timeline: splash dikhe -> fade-out + reveal ek saath -> splash unmount
  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), SPLASH_MS);
    const t2 = setTimeout(
      () => setShowSplash(false),
      SPLASH_MS + HANDOFF_MS + 40,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const studentCollection = getUserStudentsCollection();
    if (!studentCollection) {
      setTotalStudents(0);
      setPendingFees(0);
      return;
    }

    const unsub = onSnapshot(studentCollection, (snapshot: any) => {
      setTotalStudents(snapshot.size);
      const pending = snapshot.docs.filter(
        (d: any) => d.data().feeStatus === "pending",
      ).length;
      setPendingFees(pending);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authInstance?.currentUser) return;

      try {
        const userDoc = await getDoc(
          doc(firestoreDb, "users", authInstance.currentUser.uid),
        );
        if (userDoc.exists()) {
          setProfile({
            name: userDoc.data().name || "Teacher",
            subject: userDoc.data().subject || "All Subjects",
            email: userDoc.data().email || authInstance.currentUser.email || "",
          });
        } else {
          setProfile({
            name: "Teacher",
            subject: "All Subjects",
            email: authInstance.currentUser.email || "",
          });
        }
      } catch (error) {
        console.warn("Could not fetch profile:", error);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Are you sure you want to logout?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(authInstance);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Could not sign out.";
            Alert.alert("Logout Error", message);
          }
        },
      },
    ]);
  };

  const displayName = profile.name || "Teacher";
  const pendingPercent =
    totalStudents > 0 ? Math.round((pendingFees / totalStudents) * 100) : 0;

  const studentsShown = useCountUp(totalStudents, leaving, 380);
  const pendingShown = useCountUp(pendingFees, leaving, 440);

  return (
    <View style={styles.container}>
      {/* Content hamesha mounted hai (splash ke neeche), isliye handoff smooth hai.
          Start delays: topbar 80 -> tracker 160 -> stats count 380 -> bar 560 -> actions 320+ */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showSplash}
      >
        <Reveal go={leaving} delay={80} style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topTitle} numberOfLines={1}>
              Hello, {displayName} 👋
            </Text>
            <Text style={styles.eyebrow}>
              {profile.subject || "All Subjects"}
            </Text>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              activeOpacity={0.85}
            >
              <View style={styles.avatarRing}>
                <Avatar
                  name={displayName}
                  size={46}
                  backgroundColor={theme.colors.secondarySoft}
                  textColor={theme.colors.primaryStrong}
                />
              </View>
            </TouchableOpacity>
          </View>
        </Reveal>

        <Reveal go={leaving} delay={160} style={styles.tracker}>
          <View style={styles.trackerHead}>
            <View style={styles.trackerBadge}>
              <Ionicons name="stats-chart" size={14} color="#fff" />
            </View>
            <Text style={styles.trackerTitle}>Student tracker</Text>
          </View>

          <View style={styles.statsRow}>
            <View
              style={[
                styles.stat,
                {
                  backgroundColor: theme.colors.primarySoft,
                  borderColor: "#F2D6BF",
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="people" size={18} color="#fff" />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {studentsShown}
              </Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>

            <View
              style={[
                styles.stat,
                {
                  backgroundColor: theme.colors.dangerSoft,
                  borderColor: "#F3D2C7",
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.danger },
                ]}
              >
                <Ionicons name="cash" size={18} color="#fff" />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                {pendingShown}
              </Text>
              <Text style={styles.statLabel}>Pending fees</Text>
            </View>
          </View>

          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Fees pending</Text>
            <Text style={styles.barPercent}>{pendingPercent}%</Text>
          </View>
          <TrackerBar percent={pendingPercent} go={leaving} delay={560} />
          <Text style={styles.barNote}>
            {pendingFees} of {totalStudents} students have pending fees
          </Text>
        </Reveal>

        <Reveal go={leaving} delay={300}>
          <Text style={styles.sectionTitle}>Actions</Text>
        </Reveal>

        <ActionCard
          go={leaving}
          delay={340}
          icon="people"
          title="Manage students"
          subtitle="Add, update, and review progress"
          color={theme.colors.primary}
          soft={theme.colors.primarySoft}
          onPress={() => router.push("/students")}
        />
        <ActionCard
          go={leaving}
          delay={410}
          icon="calendar"
          title="Attendance"
          subtitle="Track class-by-class presence"
          color={theme.colors.secondary}
          soft={theme.colors.secondarySoft}
          onPress={() => router.push("/attendance")}
        />
        <ActionCard
          go={leaving}
          delay={480}
          icon="wallet"
          title="Fee status"
          subtitle="Reminders and payment updates"
          color={theme.colors.warning}
          soft={theme.colors.warningSoft}
          onPress={() => router.push("/fees")}
        />
      </ScrollView>

      {showSplash && <WelcomeSplash name={displayName} leaving={leaving} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // paddingBottom floating tab bar ke liye
  content: { paddingHorizontal: 20, paddingBottom: 120 },

  /* Splash */
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  splashIconWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  ring: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#fff",
  },
  splashIcon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  splashEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 2,
  },
  splashName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.8,
    marginTop: 8,
  },
  splashHint: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    marginTop: 18,
  },

  /* Top bar */
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  topTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: 1,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  
  avatarRing: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.card,
  },

  /* Tracker */
  tracker: {
    backgroundColor: theme.colors.card,
    borderRadius: 30,
    padding: 18,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  trackerHead: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  trackerBadge: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  stat: { flex: 1, borderRadius: 22, padding: 14, borderWidth: 1 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 32, fontWeight: "800", letterSpacing: -1 },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textSecondary,
  },
  barPercent: { fontSize: 12, fontWeight: "800", color: theme.colors.danger },
  barTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.dangerSoft,
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    borderRadius: 6,
    backgroundColor: theme.colors.danger,
  },
  barNote: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: 8,
  },

  /* Actions */
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    overflow: "hidden",
    ...theme.shadows.card,
  },
  actionAccent: {
    position: "absolute",
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    borderRadius: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    marginRight: 14,
  },
  actionText: { flex: 1 },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.textPrimary,
  },
  actionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: "600",
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
