import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../../constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

// Sirf yahi tab bar mein dikhenge. Name = asli route name.
const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Home", icon: "home" },
  { name: "attendance", title: "Attendance", icon: "calendar" },
  { name: "students/index", title: "Students", icon: "people" },
  { name: "fees", title: "fees", icon: "person" },
];

const BAR_HEIGHT = 68;
const PAD = 8;

/* ---------- Single tab item ---------- */
function TabItem({
  icon,
  title,
  focused,
  onPress,
  onLongPress,
}: {
  icon: IconName;
  title: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(focused ? 1 : 0, { damping: 12, stiffness: 180 });
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -2 * lift.value },
      { scale: 1 + 0.15 * lift.value },
    ],
  }));

  const color = focused ? theme.colors.primary : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.item}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={title}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={focused ? icon : (`${icon}-outline` as IconName)}
          size={22}
          color={color}
        />
      </Animated.View>
      <Animated.Text style={[styles.label, { color }]}>{title}</Animated.Text>
    </Pressable>
  );
}

/* ---------- Liquid glass tab bar ---------- */
function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);

  // Sirf TABS wale routes, usi order mein
  const visible = TABS.map((t) =>
    state.routes.find((r) => r.name === t.name),
  ).filter(Boolean) as typeof state.routes;

  const current = state.routes[state.index];
  const activeIdx = visible.findIndex((r) => r.key === current.key);

  const tabWidth = width > 0 ? (width - PAD * 2) / visible.length : 0;

  const x = useSharedValue(0);
  const stretch = useSharedValue(1);
  const show = useSharedValue(0);

  useEffect(() => {
    if (tabWidth === 0) return;
    if (activeIdx < 0) {
      show.value = withTiming(0, { duration: 200 }); // hidden screen par blob chhupa do
      return;
    }
    show.value = withTiming(1, { duration: 200 });
    x.value = withSpring(activeIdx * tabWidth, {
      damping: 15,
      stiffness: 140,
      mass: 0.9,
    });
    // liquid stretch: chalte waqt lamba, phir wapas gol
    stretch.value = withSequence(
      withTiming(1.3, { duration: 130 }),
      withSpring(1, { damping: 8, stiffness: 150 }),
    );
  }, [activeIdx, tabWidth]);

  const blobStyle = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ translateX: x.value }, { scaleX: stretch.value }],
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}
    >
      <View
        style={styles.glass}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {/* Frosted blur */}
        <BlurView
          intensity={Platform.OS === "ios" ? 40 : 70}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        {/* Glass tint + top highlight */}
        <View style={styles.tint} pointerEvents="none" />
        <View style={styles.highlight} pointerEvents="none" />

        {/* Liquid blob */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.blob,
              { width: tabWidth, left: PAD, top: PAD },
              blobStyle,
            ]}
          />
        )}

        {/* Tabs */}
        <View style={styles.row}>
          {visible.map((route, i) => {
            const meta = TABS.find((t) => t.name === route.name)!;
            const focused = i === activeIdx;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                navigation.navigate(route.name as never);
              }
            };

            return (
              <TabItem
                key={route.key}
                icon={meta.icon}
                title={meta.title}
                focused={focused}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: "tabLongPress", target: route.key })
                }
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      {TABS.map(({ name, title }) => (
        <Tabs.Screen key={name} name={name} options={{ title }} />
      ))}

      {/* Tab bar se hidden, router.push() se khulenge */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen name="students/add" options={{ href: null }} />
      <Tabs.Screen
        name="students/[id]/attendance-history"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", left: 20, right: 20 },
  glass: {
    height: BAR_HEIGHT,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor:
      Platform.OS === "android" ? "rgb(255, 255, 255)" : "transparent",
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  blob: {
    position: "absolute",
    height: BAR_HEIGHT - PAD * 2,
    borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
    opacity: 0.8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  row: { flex: 1, flexDirection: "row", padding: PAD },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
});
