import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/config";
import { useCats } from "../src/hooks/useCats";
import { getFullUri } from "../src/services/storage/fileStorage";

export default function CatDexScreen() {
  const router = useRouter();
  const { cats } = useCats();
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = cats.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesFavorite = favoritesOnly ? cat.is_favorite === 1 : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search cats..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.favToggle}
        onPress={() => setFavoritesOnly(!favoritesOnly)}
      >
        <Text style={styles.favToggleText}>
          {favoritesOnly ? "★ Showing Favorites" : "☆ Show Favorites Only"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ padding: SPACING.sm }}
        ListEmptyComponent={<Text style={styles.empty}>No cats found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/cat/${item.id}`)}
          >
            <Image
              source={{ uri: getFullUri(item.sticker_photo_path) }}
              style={styles.stickerImage}
            />
            <Text style={styles.catName} numberOfLines={1}>
              {item.is_favorite ? "★ " : ""}{item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchInput: {
    margin: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  favToggle: { marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  favToggleText: { color: COLORS.primaryDark, fontWeight: "600" },
  empty: { textAlign: "center", color: COLORS.textMuted, marginTop: SPACING.xl },
  card: {
    flex: 1,
    margin: SPACING.xs,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
  },
  stickerImage: { width: "100%", height: 120, borderRadius: RADIUS.sm, backgroundColor: "#eee" },
  catName: { marginTop: SPACING.xs, fontWeight: "600", color: COLORS.text },
});