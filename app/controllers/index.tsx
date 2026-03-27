import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter, useFocusEffect } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { CameraView, useCameraPermissions } from 'expo-camera';
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

export default function ControllerListScreen() {
  const [controllers, setControllers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newController, setNewController] = useState({ name: '', imei: '' });
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  const fetchControllers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/controllers`);
      setControllers(response.data);
    } catch (error: any) {
      console.error("Erreur récup controllers:", error);
      Alert.alert("Erreur", "Impossible de charger les contrôleurs");
    } finally {
      setLoading(false);
    }
  }, []);

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
      await SecureStore.setItemAsync('selectedControllerId', controller.id);
      await SecureStore.setItemAsync('selectedControllerName', controller.name);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner le contrôleur");
    }
  };

  const addController = async () => {
    if (!newController.name || !newController.imei) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    try {
      await axios.post(`${API_URL}/controllers`, newController);
      setModalVisible(false);
      setNewController({ name: '', imei: '' });
      fetchControllers();
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Impossible d'ajouter le contrôleur");
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    setNewController(prev => ({ ...prev, imei: data }));
    setModalVisible(true);
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
        <Text style={styles.title}>Mes Contrôleurs</Text>
        <Text style={styles.subtitle}>Sélectionnez un appareil pour commencer</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.green} style={styles.loader} />
      ) : (
        <FlatList
          data={controllers}
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Nouveau Contrôleur</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nom du contrôleur (ex: Verger Nord)"
              value={newController.name}
              onChangeText={(text) => setNewController(prev => ({ ...prev, name: text }))}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputInContainer}
                placeholder="IMEI"
                keyboardType="numeric"
                value={newController.imei}
                onChangeText={(text) => setNewController(prev => ({ ...prev, imei: text }))}
              />
              <TouchableOpacity style={styles.scanBtnInside} onPress={startScanning}>
                <Ionicons name="qr-code-outline" size={24} color={COLORS.green} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.addBtn]} onPress={addController}>
                <Text style={styles.addText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 5 },
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
