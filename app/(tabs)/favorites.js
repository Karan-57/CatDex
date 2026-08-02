import { useRouter } from "expo-router";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../src/constants/config";
import { useCats } from "../../src/hooks/useCats";
import { getFullUri } from "../../src/services/storage/fileStorage";

export default function FavoritesScreen() {
  const router = useRouter();
  const { cats } = useCats();

  const favoriteCats = cats.filter((cat) => cat.is_favorite === 1);

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteCats}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ padding: SPACING.sm, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No favorites yet. Tap the star on detail page to add one.
            </Text>
          </View>
        }
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
              ★ {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyText: { textAlign: "center", color: COLORS.textMuted, fontSize: 14 },
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