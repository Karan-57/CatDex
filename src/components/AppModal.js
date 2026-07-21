import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/config";

/**
 * A reusable modal for confirmations/success messages, styled to match
 * the app instead of using the plain OS-native Alert.
 *
 * @param {boolean} visible
 * @param {string} title
 * @param {string} message
 * @param {Array} actions - [{ label, onPress, style: "primary"|"danger"|"secondary" }]
 * @param {function} onClose
 */
export default function AppModal({ visible, title, message, actions, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actionRow}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  action.style === "danger" && styles.dangerButton,
                  action.style === "secondary" && styles.secondaryButton,
                ]}
                onPress={action.onPress}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.style === "secondary" && styles.secondaryText,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: "100%",
    maxWidth: 340,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.xs },
  message: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.md, lineHeight: 20 },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", gap: SPACING.sm, marginTop: SPACING.sm },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  dangerButton: { backgroundColor: COLORS.danger },
  secondaryButton: { backgroundColor: "transparent" },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  secondaryText: { color: COLORS.textMuted },
});