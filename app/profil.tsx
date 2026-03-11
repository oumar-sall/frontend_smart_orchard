import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#2C2C2C",
  textSecondary: "#888",
  border: "#E8E0D8",
};

export default function ProfilScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color={COLORS.textPrimary} />
          <Text style={styles.editText}>Modifier</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={COLORS.green} />
          </View>
          <Text style={styles.userName}>Amadou Diallo</Text>
          <Text style={styles.userRole}>Technicien agricole</Text>
        </View>

        <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PRENOM</Text>
                <Text style={styles.infoValue}>Amadou</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>NOM</Text>
                <Text style={styles.infoValue}>Diallo</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>EMAIL</Text>
                <Text style={styles.infoValue}>amadou.diallo@smartorchard.ml</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>TELEPHONE</Text>
                <Text style={styles.infoValue}>+223 76 12 34 56</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>AFFECTATION</Text>
        <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Ici se trouvera l&apos;Affectation</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 16, color: COLORS.textPrimary },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editText: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },

  avatarSection: { alignItems: "center", marginTop: 20, marginBottom: 32 },
  avatarLarge: {
    width: 100,
    height: 100,
    backgroundColor: "#EAF2EC",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  userName: { fontSize: 24, fontWeight: "700", color: COLORS.textPrimary },
  userRole: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },

  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    backgroundColor: "#F5FDF5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: "#F2F2F2", marginHorizontal: 16 },

  placeholderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  placeholderText: { fontSize: 14, color: COLORS.textSecondary },
});
