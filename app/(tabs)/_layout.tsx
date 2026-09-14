import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import theme from "../../constants/theme";

function TabIcon({ name, color, active }: { name: keyof typeof Ionicons.glyphMap; color?: string; active?: boolean }) {
  return (
    <View
      style={{
        width: 46,
        height: 34,
        borderRadius: 18,
        backgroundColor: active ? "rgba(232, 163, 61, 0.20)" : "transparent",
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
          backgroundColor: "#FFF8ED",
          borderTopWidth: 0,
          borderRadius: 26,
          marginHorizontal: 18,
          marginBottom: 12,
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.10,
          shadowRadius: 18,
          elevation: 6,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#B0A399",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 4,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={String(color)} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={String(color)} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          title: "Students",
          tabBarIcon: ({ color, focused }) => <TabIcon name="people" color={String(color)} active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={String(color)} active={focused} />,
        }}
      />
    </Tabs>
  );
}