import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "../src/constants/config";
import { CatProvider } from "../src/context/CatContext";

export default function RootLayout() {
  return (
    <CatProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "CatDex" }} />
        <Stack.Screen name="camera" options={{ title: "Take a Photo", headerShown: false }} />
        <Stack.Screen name="sticker-preview" options={{ title: "Preview Sticker" }} />
        <Stack.Screen name="save-cat" options={{ title: "Save Cat" }} />
        <Stack.Screen name="catdex" options={{ title: "CatDex Collection" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="cat/[id]" options={{ title: "Cat Details" }} />
        <Stack.Screen name="cat/[id]/edit" options={{ title: "Edit Cat" }} />
      </Stack>
    </CatProvider>
  );
}