import { Stack } from "expo-router";
import { CatProvider } from "../src/context/CatContext";

export default function RootLayout() {
  return (
    <CatProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "CatDex" }} />
      </Stack>
    </CatProvider>
  );
}