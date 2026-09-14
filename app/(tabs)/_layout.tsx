import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import theme from "../../constants/theme";

function TabIcon({ name, color, active }: { name: keyof typeof Ionicons.glyphMap; color?: string; active?: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 34,
        borderRadius: 16,
        backgroundColor: active ? theme.colors.primarySoft : "transparent",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name={name} size={21} color={active ? theme.colors.primary : color || theme.colors.textSecondary} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(255, 248, 237, 0.96)",
          borderTopWidth: 0,
          borderRadius: 28,
          marginHorizontal: 18,
          marginBottom: 12,
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.10,
          shadowRadius: 18,
          elevation: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#A19186",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={String(color)} active={focused} />,
        }}
      />

      {/* 2. Calendar */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={String(color)} active={focused} />,
        }}
      />

      {/* 3. Students (all enrolled) */}
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, focused }) => <TabIcon name="people" color={String(color)} active={focused} />,
        }}
      />

      {/* 4. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={String(color)} active={focused} />,
        }}
      />

      {/* Hidden from tab bar — still accessible via router.push() */}
      <Tabs.Screen name="fees" options={{ href: null }} />
    </Tabs>
  );
}