import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "../src/constants/config";
import { CatProvider } from "../src/context/CatContext";
import { PetProvider } from "../src/context/PetContext";

export default function RootLayout() {
  return (
    <CatProvider>
      <PetProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.text,
            headerTitleStyle: { fontWeight: "600" },
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