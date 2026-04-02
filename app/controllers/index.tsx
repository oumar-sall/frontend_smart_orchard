import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter, useFocusEffect } from "expo-router";
import { storage } from "@/utils/storage";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { API_URL } from "@/constants/Api";
import { logger } from "@/shared/logger";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  border: "#E8E0D8",
  danger: "#FF3B30",
  inactive: "#9E9E9E",
};

export default function ControllerListScreen() {
  const [controllers, setControllers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('join');
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundController, setFoundController] = useState<any | null>(null);
  const [newController, setNewController] = useState({ name: '', imei: '', security_pin: '' });
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchControllers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await storage.getItem("userToken");
      const response = await axios.get(`${API_URL}/controllers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setControllers(response.data);
    } catch (error: any) {
      logger.error("Erreur récup controllers:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        await storage.clearAll();
        router.replace("/login");
      } else {
        Alert.alert("Erreur", "Impossible de charger les contrôleurs");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchControllers();
  }, [fetchControllers]);

  useFocusEffect(
    useCallback(() => {
      fetchControllers();
    }, [fetchControllers])
  );

  const selectController = async (controller: any) => {
    try {
      await storage.setItem('selectedControllerId', controller.id);
      await storage.setItem('selectedControllerName', controller.name);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner le contrôleur");
    }
  };

  const lookupImei = async (overrideImei?: string) => {
    const imei = (overrideImei || newController.imei)?.trim();
    if (!imei) return;
    
    setSearchLoading(true);
    setFoundController(null);
    setHasSearched(true);
    try {
      const token = await storage.getItem("userToken");
      const response = await axios.get(`${API_URL}/controllers/search?imei=${imei}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoundController(response.data);
      // On met à jour le champ avec l'IMEI nettoyé et le nom trouvé
      setNewController(prev => ({ ...prev, imei, name: response.data.name }));
    } catch (error: any) {
      if (error.response?.status !== 404) {
        logger.error("Erreur lookup imei:", error);
      }
      setFoundController(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const addController = async () => {
    // Validation selon le mode
    if (modalMode === 'create' && !newController.name) {
      Alert.alert("Erreur", "Veuillez donner un nom au contrôleur");
      return;
    }
    if (!newController.imei || !newController.security_pin) {
      Alert.alert("Erreur", "IMEI et PIN de sécurité requis");
      return;
    }

    try {
      setLoading(true);
      const token = await storage.getItem("userToken");
      await axios.post(`${API_URL}/controllers`, newController, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModalVisible(false);
      setNewController({ name: '', imei: '', security_pin: '' });
      setFoundController(null);
      fetchControllers();
      Alert.alert("Succès", modalMode === 'create' ? "Contrôleur créé" : "Contrôleur rejoint");
    } catch (error: any) {
      logger.error("Erreur ajout controller:", error);
      Alert.alert("Erreur", error.response?.data?.error || "Impossible d'opérer");
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    const cleanImei = data?.trim();
    setNewController(prev => ({ ...prev, imei: cleanImei }));
    setModalVisible(true);
    if (modalMode === 'join') {
      lookupImei(cleanImei);
    }
  };

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour scanner le QR code.");
        return;
      }
    }
    setModalVisible(false);
    setScanning(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => selectController(item)}>
      <View style={styles.cardHeader}>
        <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.imei}>IMEI: {item.imei}</Text>
        </View>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/controllers/${item.id}` as any);
          }}
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mes Contrôleurs</Text>
          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => router.push("/(tabs)/profil" as any)}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.green} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Gérez vos appareils connectés</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou IMEI..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && controllers.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.green} style={styles.loader} />
      ) : (
        <FlatList
          data={controllers.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.imei.includes(searchQuery)
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Aucun contrôleur enregistré</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setFoundController(null);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Ajouter un Contrôleur</Text>

            <View style={styles.modeToggle}>
              <TouchableOpacity 
                style={[styles.modeBtn, modalMode === 'join' && styles.modeBtnActive]}
                onPress={() => {
                  setModalMode('join');
                  setFoundController(null);
                  setHasSearched(false);
                }}
              >
                <Text style={[styles.modeBtnText, modalMode === 'join' && styles.modeBtnTextActive]}>Rejoindre</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeBtn, modalMode === 'create' && styles.modeBtnActive]}
                onPress={() => {
                  setModalMode('create');
                  setFoundController(null);
                  setHasSearched(false);
                }}
              >
                <Text style={[styles.modeBtnText, modalMode === 'create' && styles.modeBtnTextActive]}>Nouveau</Text>
              </TouchableOpacity>
            </View>
            
            {modalMode === 'create' && (
              <TextInput
                style={styles.input}
                placeholder="Nom du contrôleur (ex: Verger Nord)"
                value={newController.name}
                onChangeText={(text) => setNewController(prev => ({ ...prev, name: text }))}
              />
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputInContainer}
                placeholder="IMEI"
                keyboardType="numeric"
                value={newController.imei}
                onChangeText={(text) => {
                  setNewController(prev => ({ ...prev, imei: text }));
                  setHasSearched(false); // Réinitialiser si l'utilisateur modifie manuellement
                }}
                onBlur={modalMode === 'join' ? () => lookupImei() : undefined}
              />
              <TouchableOpacity style={styles.scanBtnInside} onPress={startScanning}>
                <Ionicons name="qr-code-outline" size={24} color={COLORS.green} />
              </TouchableOpacity>
            </View>

            {modalMode === 'join' && (
              <View style={styles.lookupResult}>
                {searchLoading ? (
                  <ActivityIndicator size="small" color={COLORS.green} />
                ) : foundController ? (
                  <View style={styles.foundInfo}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                    <Text style={styles.foundText}>Boîtier trouvé : {foundController.name}</Text>
                  </View>
                ) : (newController.imei.length > 5 && hasSearched) ? (
                  <Text style={styles.notFoundText}>Aucun boîtier correspondant</Text>
                ) : null}
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputInContainer}
                placeholder="PIN de sécurité (ex: 123456)"
                keyboardType="numeric"
                secureTextEntry
                value={newController.security_pin}
                onChangeText={(text) => setNewController(prev => ({ ...prev, security_pin: text }))}
              />
              <View style={styles.pinIconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color={COLORS.green} />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelBtn]} 
                onPress={() => {
                  setModalVisible(false);
                  setFoundController(null);
                }}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addBtn, (modalMode === 'join' && !foundController) && styles.buttonDisabled]} 
                onPress={addController}
                disabled={modalMode === 'join' && !foundController}
              >
                <Text style={styles.addText}>{modalMode === 'create' ? "Créer" : "Rejoindre"}</Text>
              </TouchableOpacity>
            </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL SCANNER */}
      <Modal
        visible={scanning}
        animationType="fade"
        onRequestClose={() => {
          setScanning(false);
          setModalVisible(true);
        }}
      >
        <SafeAreaView style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={styles.focusedItem}></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.scannerHeader}>
            <TouchableOpacity style={styles.closeScanner} onPress={() => {
              setScanning(false);
              setModalVisible(true);
            }}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scanner le code IMEI</Text>
          </View>
          <View style={styles.scannerFooter}>
            <Text style={styles.scannerText}>Placez le code-barres dans le cadre</Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 20, marginBottom: 10 },
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  profileBtn: {
    padding: 4,
  },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  loader: { marginTop: 50 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  headerText: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "600", color: COLORS.textPrimary },
  imei: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  settingsBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: COLORS.green,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: COLORS.textSecondary },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: COLORS.textPrimary },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  button: { flex: 1, height: 45, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  cancelBtn: { marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { backgroundColor: COLORS.green },
  cancelText: { color: COLORS.textSecondary, fontWeight: "600" },
  addText: { color: "white", fontWeight: "bold" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  inputInContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    flex: 1,
  },
  scanBtnInside: {
    padding: 10,
    marginLeft: 5,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pinIconContainer: {
    padding: 10,
    marginLeft: 5,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    width: "100%",
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  modeBtnTextActive: {
    color: COLORS.green,
  },
  lookupResult: {
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 5,
    minHeight: 20,
    justifyContent: "center",
  },
  foundInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF2EC",
    padding: 8,
    borderRadius: 8,
  },
  foundText: {
    marginLeft: 8,
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "500",
  },
  notFoundText: {
    color: COLORS.danger,
    fontSize: 12,
    textAlign: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.inactive,
    opacity: 0.6,
  },
  // Scanner styles
  scannerContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  scannerHeader: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  closeScanner: {
    padding: 10,
  },
  scannerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
  },
  scannerFooter: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scannerText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  focusedContainer: {
    height: 250,
    flexDirection: 'row',
  },
  focusedItem: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
});
