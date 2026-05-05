import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { COLORS } from "../../constants/Theme";
import { useProfile } from "../../hooks/useProfile";

export default function ProfilScreen() {
  const router = useRouter();
  const {
    user, isEditing, setIsEditing,
    firstName, setFirstName,
    lastName, setLastName,
    loading, handleUpdate, handleLogout, handleDeleteAccount,
    refreshUser
  } = useProfile();

  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mon Profil</Text>
        
        <View style={styles.headerActions}>
          {isEditing && (
            <TouchableOpacity 
              style={styles.cancelIconButton} 
              onPress={() => setIsEditing(false)}
              disabled={loading}
            >
              <Ionicons name="close-circle-outline" size={28} color={COLORS.danger} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.editButton, isEditing && { backgroundColor: COLORS.green }]}
            onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name={isEditing ? "checkmark" : "pencil"} size={16} color={isEditing ? "#FFF" : COLORS.textPrimary} />
                <Text style={[styles.editText, isEditing && { color: "#FFF" }]}>{isEditing ? "Enregistrer" : "Modifier"}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person" size={48} color={COLORS.green} />
            </View>
            <Text style={styles.userName}>{user ? `${user.first_name} ${user.last_name}` : "Chargement..."}</Text>
            <Text style={styles.userRole}>Utilisateur Smart Orchard</Text>
          </View>

          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>

          <View style={styles.infoCard}>
            <InfoRow 
              label="PRÉNOM" 
              icon="person-outline" 
              value={user?.first_name} 
              isEditing={isEditing} 
              inputValue={firstName} 
              onInputChange={setFirstName} 
            />
            <View style={styles.divider} />
            <InfoRow 
              label="NOM" 
              icon="person-outline" 
              value={user?.last_name} 
              isEditing={isEditing} 
              inputValue={lastName} 
              onInputChange={setLastName} 
            />
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={18} color={COLORS.green} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>TÉLÉPHONE (ID)</Text>
                <Text style={[styles.infoValue, { color: COLORS.textSecondary }]}>{user?.phone || "---"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsBox}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLogout}>
              <View style={styles.actionIconBox}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} />
              </View>
              <Text style={styles.actionBtnText}>Déconnexion</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { marginTop: 12 }]} onPress={handleDeleteAccount}>
              <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </View>
              <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>Supprimer mon compte</Text>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} opacity={0.5} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

function InfoRow({ label, icon, value, isEditing, inputValue, onInputChange }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={18} color={COLORS.green} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={onInputChange}
            placeholder={`Saisissez votre ${label.toLowerCase()}`}
            placeholderTextColor={COLORS.textSecondary}
          />
        ) : (
          <Text style={styles.infoValue}>{value || "---"}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)', backgroundColor: COLORS.card },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  cancelIconButton: { padding: 4 },
  editButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EAEAEA", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  editText: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  avatarSection: { alignItems: "center", marginTop: 20, marginBottom: 32 },
  avatarLarge: { width: 100, height: 100, backgroundColor: "#EAF2EC", borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  userName: { fontSize: 24, fontWeight: "700", color: COLORS.textPrimary },
  userRole: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#8E8E93", letterSpacing: 0.5, marginBottom: 12, marginTop: 8 },
  infoCard: { backgroundColor: COLORS.card, borderRadius: 20, elevation: 2, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 16 },
  infoIconBox: { width: 36, height: 36, backgroundColor: "#F5FDF5", borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: "#F2F2F2", marginHorizontal: 16 },
  input: { fontSize: 15, fontWeight: "600", color: COLORS.green, padding: 0, marginTop: 2 },
  actionsBox: { marginTop: 32, gap: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, padding: 16, borderRadius: 20, gap: 16, elevation: 2 },
  actionIconBox: { width: 40, height: 40, backgroundColor: "#F5F5F5", borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionBtnText: { flex: 1, fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
});
