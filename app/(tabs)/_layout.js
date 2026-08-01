import { Tabs, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/config";

// Custom center button for the "+" tab. Instead of navigating to a real
// tab screen, tapping this immediately pushes the Camera screen (outside
// the tab group). This keeps the tab bar's visual symmetry (5 icons)
// without needing a real "Add Cat" tab screen that would flash on tap.
function AddCatButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => router.push("/add-cat-choice")}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: "600" },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "CatDex",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="catdex"
        options={{
          title: "CatDex Collection",
          tabBarLabel: "CatDex",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-cat-placeholder"
        options={{
          tabBarLabel: "",
          tabBarButton: () => (
            <View style={styles.centerButtonWrapper}>
              <AddCatButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarLabel: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    top: -16,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});