import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#2C2C2C",
  textSecondary: "#888",
};

function AppHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <View>
          <Text style={styles.appName}>Smart Orchard</Text>
          <Text style={styles.location}>📍 Verger Nord - Bamako</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.tempBadge}>
          <Text style={styles.tempText}>☀️ 34°C</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>En ligne</Text>
        </View>
      </View>
    </View>
  );
}

export default function CapteursScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <AppHeader />
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Ici se trouvera les Capteurs
          </Text>
          <Text style={styles.placeholderSub}>
            Liste des capteurs · Statut · Valeurs en temps réel
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 42,
    height: 42,
    backgroundColor: "#DFF0E0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 22 },
  appName: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  location: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  headerRight: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  tempBadge: {
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E0D8",
  },
  tempText: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8E0D8",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  onlineText: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary },
  placeholderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 20,
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.green,
    textAlign: "center",
    marginBottom: 10,
  },
  placeholderSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
