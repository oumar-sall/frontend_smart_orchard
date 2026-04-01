import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

import { storage } from "@/utils/storage";
import { API_URL } from "@/constants/Api";
import { useRouter } from "expo-router";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#2C2C2C",
  textSecondary: "#888",
  border: "#E8E0D8",
  danger: "#EF4444",
};

export default function ProfilScreen() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const loadUser = React.useCallback(async () => {
    const data = await storage.getItem('userData');
    if (data) {
      const parsedUser = JSON.parse(data);
      setUser(parsedUser);
      setFirstName(parsedUser.first_name);
      setLastName(parsedUser.last_name);
    }
  }, []);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Erreur", "Le nom et le prénom sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      const token = await storage.getItem('userToken');
      const response = await axios.put(`${API_URL}/auth/update-profile`, 
        { first_name: firstName, last_name: lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.user) {
        await storage.setItem('userData', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsEditing(false);
        Alert.alert("Succès", "Profil mis à jour");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Déconnexion", 
        onPress: async () => {
          await storage.deleteItem('userToken');
          await storage.deleteItem('userData');
          await storage.deleteItem('selectedControllerId');
          await storage.deleteItem('selectedControllerName');
          router.replace('/login');
        }
      }
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "SUPPRIMER LE COMPTE", 
      "Cette action est irréversible. Vos accès et données seront définitivement supprimés.",
      [
        { text: "ANNULER", style: "cancel" },
        { 
          text: "SUPPRIMER", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "CONFIRMATION FINALE",
              "Voulez-vous vraiment supprimer votre compte ?",
              [
                { text: "NON", style: "cancel" },
                { 
                  text: "OUI, SUPPRIMER TOUT", 
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      const token = await storage.getItem('userToken');
                      await axios.delete(`${API_URL}/auth/delete-account`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      await storage.clearAll(); // On nettoie tout
                      router.replace('/login');
                    } catch (error) {
                      console.error("Erreur suppression compte:", error);
                      Alert.alert("Erreur", "Impossible de supprimer le compte");
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={COLORS.green} />
          </View>
          <Text style={styles.userName}>{user ? `${user.first_name} ${user.last_name}` : "Chargement..."}</Text>
          <Text style={styles.userRole}>Utilisateur Smart Orchard</Text>
        </View>

        <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>

        <View style={styles.infoCard}>
          {/* PRÉNOM */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PRÉNOM</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Saisissez votre prénom"
                  />
                ) : (
                  <Text style={styles.infoValue}>{user?.first_name || "---"}</Text>
                )}
            </View>
          </View>
          
          <View style={styles.divider} />

          {/* NOM */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={18} color={COLORS.green} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>NOM</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Saisissez votre nom"
                  />
                ) : (
                  <Text style={styles.infoValue}>{user?.last_name || "---"}</Text>
                )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* TÉLÉPHONE (FIXE) */}
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
          {isEditing && (
             <TouchableOpacity style={styles.cancelLink} onPress={() => { setIsEditing(false); loadUser(); }}>
                <Text style={styles.cancelLinkText}>Annuler les modifications</Text>
             </TouchableOpacity>
          )}

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
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

  input: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.green,
    padding: 0,
    marginTop: 2,
  },

  actionsBox: {
    marginTop: 32,
    gap: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cancelLink: {
    alignItems: "center",
    marginBottom: 16,
  },
  cancelLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
});
