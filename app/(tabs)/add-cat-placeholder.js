import { View } from "react-native";

// This screen is never actually navigated to — the tab bar intercepts
// taps on this tab via a custom tabBarButton (see (tabs)/_layout.js)
// and redirects straight to the Camera screen instead.
export default function AddCatPlaceholder() {
  return <View />;
}