import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  border: "#E8E0D8",
};


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
