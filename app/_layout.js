import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../src/constants/config";
import { CatProvider } from "../src/context/CatContext";
import { PetProvider } from "../src/context/PetContext";
import { initDatabase } from "../src/services/database/db";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDatabase();
      setDbReady(true);
    })();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <CatProvider>
      <PetProvider>
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: "600" },
            headerRight: () => <FishHeaderBadge />,
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-cat-choice" options={{ title: "Add a Cat" }} />
          <Stack.Screen name="camera" options={{ title: "Take a Photo", headerShown: false }} />
          <Stack.Screen name="sticker-preview" options={{ title: "Preview Sticker" }} />
          <Stack.Screen name="save-cat" options={{ title: "Save Cat" }} />
          <Stack.Screen name="cat/[id]" options={{ title: "Cat Details" }} />
          <Stack.Screen name="cat/[id]/edit" options={{ title: "Edit Cat" }} />
        </Stack>
      </PetProvider>
    </CatProvider>
  );
}