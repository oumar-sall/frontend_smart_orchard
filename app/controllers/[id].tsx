import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { storage } from "@/utils/storage";
import { API_URL } from "@/constants/Api";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  border: "#E8E0D8",
  danger: "#FF3B30",
};

export default function ManageControllerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [controller, setController] = useState({ name: '', imei: '' });

  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const fetchController = React.useCallback(async () => {
    try {
      const token = await storage.getItem("userToken");
      const response = await axios.get(`${API_URL}/controllers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setController(response.data);
    } catch {
      Alert.alert("Erreur", "Impossible de charger les informations du contrôleur");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const fetchStatus = React.useCallback(async () => {
    try {
      const token = await storage.getItem("userToken");
      const response = await axios.get(`${API_URL}/readings/status`, {
        params: { controller_id: id },
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsOnline(response.data.online);
    } catch {
      setIsOnline(false);
    }
  }, [id]);

  useEffect(() => {
    fetchController();
    
    // Vérifier si c'est le contrôleur actif et charger l'user courant
    const checkActive = async () => {
      const activeId = await storage.getItem('selectedControllerId');
      setIsActive(activeId === id);
    };
    checkActive();
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchController, fetchStatus, id]);

  const handleUpdate = async () => {
    if (!controller.name || !controller.imei) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setSaving(true);
    try {
      const token = await storage.getItem("userToken");
      const payload: any = { name: controller.name };

      await axios.put(`${API_URL}/controllers/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Succès", "Contrôleur mis à jour avec succès");
      
      const activeId = await storage.getItem('selectedControllerId');
      if (activeId === id) {
        await storage.setItem('selectedControllerName', controller.name);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erreur", error.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le contrôleur",
      "Êtes-vous sûr ? Cela supprimera également tous les capteurs, actionneurs et historiques associés.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await storage.getItem("userToken");
              await axios.delete(`${API_URL}/controllers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const activeId = await storage.getItem('selectedControllerId');
              if (activeId === id) {
                await storage.clearControllerSelection();
              }
              Alert.alert("Succès", "Contrôleur supprimé avec succès");
              router.replace("/controllers" as any);
            } catch (error) {
              console.error(error);
              Alert.alert("Erreur", "Impossible de supprimer le contrôleur");
            }
          }
        }
      ]
    );
  };

  const selectAsActive = async () => {
    try {
      await storage.setItem('selectedControllerId', id as string);
      await storage.setItem('selectedControllerName', controller.name);
      setIsActive(true);
      Alert.alert("Succès", "Cet appareil est désormais le contrôleur actif", [
        { text: "OK", onPress: () => router.replace("/(tabs)" as any) }
      ]);
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner le contrôleur");
    }
  };

  const disconnect = async () => {
    await storage.clearControllerSelection();
    setIsActive(false);
    router.replace("/controllers" as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Gérer l&apos;appareil</Text>
          </View>

          <View style={styles.infoBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="hardware-chip" size={40} color={COLORS.green} />
            </View>
            <View style={[styles.statusBadge, { borderColor: isOnline ? "#C8E6C9" : "#FFCDD2" }]}>
              <View style={[styles.onlineDot, { backgroundColor: isOnline ? "#4CAF50" : "#F44336" }]} />
              <Text style={styles.statusText}>{isOnline ? "En ligne" : "Hors ligne"}</Text>
            </View>
            {isActive && (
              <View style={styles.activeTag}>
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text style={styles.activeTagText}>Appareil Actif</Text>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nom du contrôleur</Text>
            <TextInput
              style={styles.input}
              value={controller.name}
              onChangeText={(text) => setController({ ...controller, name: text })}
              placeholder="Ex: Verger Sud"
            />

            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledInputText}>{controller.imei}</Text>
            </View>



            <TouchableOpacity 
              style={[styles.saveBtn, saving && styles.disabledBtn]} 
              onPress={handleUpdate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.optionsZone}>
            <Text style={styles.zoneTitle}>Options</Text>
            
            {!isActive && (
              <TouchableOpacity style={styles.selectBtn} onPress={selectAsActive}>
                <Ionicons name="star-outline" size={20} color={COLORS.green} />
                <Text style={styles.selectBtnText}>Sélectionner comme appareil actif</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.disconnectBtn} onPress={disconnect}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} />
              <Text style={styles.disconnectText}>Se déconnecter (Changer d&apos;appareil)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Zone de danger</Text>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={styles.deleteText}>Supprimer définitivement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary },
  infoBox: {
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  infoSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  form: {
    padding: 20,
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledInput: {
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderColor: "#E0E0E0",
  },
  disabledInputText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 55,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.green,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },
  dangerZone: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionsZone: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.danger,
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    marginBottom: 10,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    gap: 5,
  },
  activeTagText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.green + "40",
    marginBottom: 12,
  },
  selectBtnText: { marginLeft: 10, fontSize: 15, color: COLORS.green, fontWeight: "600" },
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  disconnectText: { marginLeft: 10, fontSize: 15, color: COLORS.textPrimary, fontWeight: "500" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.danger + "20",
  },
  deleteText: { marginLeft: 10, fontSize: 15, color: COLORS.danger, fontWeight: "500" },
});
