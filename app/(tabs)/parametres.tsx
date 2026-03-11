import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#2C2C2C",
  textSecondary: "#888",
  border: "#E8E0D8",
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

export default function ParametresScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <AppHeader />
        
        <Text style={styles.sectionTitle}>PARAMÈTRES</Text>
        
        <Link href="/profil" asChild>
          <TouchableOpacity style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person-outline" size={24} color={COLORS.green} />
              </View>
              <View>
                <Text style={styles.profileName}>Amadou Diallo</Text>
                <Text style={styles.profileRole}>Technicien agricole</Text>
                <Text style={styles.profileLoc}>📍 Verger Nord - Bamako</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Link>

        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>
            Ici se trouvera les Paramètres
          </Text>
          <Text style={styles.placeholderSub}>
            Notifications · Irrigation automatique · Durée par session
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
  
  // Header
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

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  profileInfo: { flexDirection: "row", alignItems: "center", gap: 16 },
  profileAvatar: {
    width: 60,
    height: 60,
    backgroundColor: "#EAF2EC",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  profileRole: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  profileLoc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },

  // Placeholder
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
    minHeight: 150,
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
