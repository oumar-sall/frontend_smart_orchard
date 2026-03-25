import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AppHeader from "../../components/AppHeader";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  tabInactiveBg: "#E8E0D8",
  border: "#E8E0D8",
  danger: "#FF3B30",
};

const API_URL = 'http://192.168.1.8:3000';
const ITEMS_PER_PAGE = 7;

const SENSOR_PINS = [
  { value: "IN 0", label: "IN 0" },
  { value: "IN 1", label: "IN 1" },
  { value: "IN 2", label: "IN 2" },
  { value: "IN 3", label: "IN 3" },
  { value: "IN 4", label: "IN 4" },
  { value: "IN 5", label: "IN 5" },
  { value: "VOL 0", label: "VOL 0" },
  { value: "VOL 1", label: "VOL 1" },
  { value: "1-WIRE", label: "1-WIRE" },
  { value: "485 A", label: "485 A (Température)" },
  { value: "485 B", label: "485 B (Humidité)" },
];

const ACTUATOR_PINS = [
  { value: "OUT 0", label: "OUT 0 (Vanne 1)" },
  { value: "OUT 1", label: "OUT 1 (Vanne 2)" },
  { value: "OUT 2", label: "OUT 2" },
  { value: "OUT 3", label: "OUT 3" },
];

const SENSOR_TEMPLATES = [
  { id: 'temp', label: 'Température', unit: '°C', min: -10, max: 50, pin: '485 A', icon: 'thermometer-outline' },
  { id: 'hum', label: 'Humidité', unit: '%', min: 0, max: 100, pin: '485 B', icon: 'water-outline' },
  { id: 'ph', label: 'pH Sol', unit: 'pH', min: 0, max: 14, pin: 'ph', icon: 'flask-outline' },
];

const COMMON_UNITS = ['°C', '%', 'pH', 'V', 'bar'];

type TabType = "capteurs" | "actionneurs";

export default function ComposantsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("capteurs");

  const [sensors, setSensors] = useState<any[]>([]);
  const [actuators, setActuators] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Pagination states
  const [sensorPage, setSensorPage] = useState(1);
  const [actuatorPage, setActuatorPage] = useState(1);

  const [isModalVisible, setModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPin, setNewPin] = useState("");

  // Custom Dynamic Component Fields
  const [newUnit, setNewUnit] = useState("");
  const [newMinValue, setNewMinValue] = useState("");
  const [newMaxValue, setNewMaxValue] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resSensors, resActuators] = await Promise.all([
        axios.get(`${API_URL}/readings/sensors`),
        axios.get(`${API_URL}/readings/actuators`)
      ]);
      setSensors(resSensors.data || []);
      setActuators(resActuators.data || []);
    } catch (error) {
      console.error("Erreur fetch composants data: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComponent = async () => {
    if (!newLabel.trim() || !newPin.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      await axios.post(`${API_URL}/readings/components`, {
        type: activeTab === 'capteurs' ? 'sensor' : 'actuator',
        label: newLabel,
        pin_number: newPin,
        unit: newUnit || undefined,
        min_value: newMinValue ? parseFloat(newMinValue) : undefined,
        max_value: newMaxValue ? parseFloat(newMaxValue) : undefined
      });
      setModalVisible(false);
      setNewLabel("");
      setNewPin("");
      setNewUnit("");
      setNewMinValue("");
      setNewMaxValue("");

      // Navigate respectively to the end if desired, or let them just fetch data
      fetchData();
      Alert.alert("Succès", "Composant ajouté avec succès");
    } catch (error: any) {
      console.error("Erreur création composant:", error);
      Alert.alert("Erreur", error?.response?.data?.error || "Impossible d'ajouter le composant");
    }
  };

  const handleDeleteComponent = (id: string) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce composant ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/readings/components/${id}`);

              // Reset pagination to avoid out of bounds on last item removal
              if (activeTab === "capteurs") setSensorPage(1);
              else setActuatorPage(1);

              fetchData();
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer le composant");
            }
          }
        }
      ]
    );
  };

  // Pagination logic
  const paginatedSensors = sensors.slice((sensorPage - 1) * ITEMS_PER_PAGE, sensorPage * ITEMS_PER_PAGE);
  const totalSensorPages = Math.ceil(sensors.length / ITEMS_PER_PAGE) || 1;

  const paginatedActuators = actuators.slice((actuatorPage - 1) * ITEMS_PER_PAGE, actuatorPage * ITEMS_PER_PAGE);
  const totalActuatorPages = Math.ceil(actuators.length / ITEMS_PER_PAGE) || 1;

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          disabled={currentPage === 1}
          onPress={() => setPage(currentPage - 1)}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? COLORS.textSecondary : COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.pageText}>Page {currentPage} / {totalPages}</Text>

        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          disabled={currentPage === totalPages}
          onPress={() => setPage(currentPage + 1)}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? COLORS.textSecondary : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSensorItem = (item: any) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemIconBox}>
        <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.label || "Capteur inconnu"}</Text>
        <Text style={styles.itemSub}>Pin: {item.pin_number || "N/A"}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComponent(item.id)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  const renderActuatorItem = (item: any) => {
    const isValve = item.label?.toLowerCase().includes('vanne');
    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemIconBox}>
          <Ionicons name={isValve ? "water" : "flash"} size={24} color={COLORS.green} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.label || "Actionneur inconnu"}</Text>
          <Text style={styles.itemSub}>Pin: {item.pin_number}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComponent(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <AppHeader />

        {/* Custom Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "capteurs" && styles.tabButtonActive]}
            onPress={() => { setActiveTab("capteurs"); setSensorPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === "capteurs" && styles.tabTextActive]}>
              Capteurs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "actionneurs" && styles.tabButtonActive]}
            onPress={() => { setActiveTab("actionneurs"); setActuatorPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === "actionneurs" && styles.tabTextActive]}>
              Actionneurs
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {activeTab === "capteurs" ? (
              <>
                {paginatedSensors.length > 0 ? paginatedSensors.map(renderSensorItem) : (
                  <Text style={styles.emptyText}>Aucun capteur trouvé.</Text>
                )}
                {sensors.length > ITEMS_PER_PAGE && renderPagination(sensorPage, totalSensorPages, setSensorPage)}
              </>
            ) : (
              <>
                {paginatedActuators.length > 0 ? paginatedActuators.map(renderActuatorItem) : (
                  <Text style={styles.emptyText}>Aucun actionneur trouvé.</Text>
                )}
                {actuators.length > ITEMS_PER_PAGE && renderPagination(actuatorPage, totalActuatorPages, setActuatorPage)}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {!loading && (
        <TouchableOpacity style={styles.fab} onPress={() => {
          setNewPin("");
          setNewLabel("");
          setNewUnit("");
          setNewMinValue("");
          setNewMaxValue("");
          setSelectedTemplate(null);
          setModalVisible(true);
        }}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Adding Component Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Ajouter un {activeTab === "capteurs" ? "capteur" : "actionneur"}
            </Text>

            {activeTab === "capteurs" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Configuration rapide (Template)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateList}>
                  {SENSOR_TEMPLATES.map(t => (
                    <TouchableOpacity 
                      key={t.id} 
                      style={[styles.templateChip, selectedTemplate === t.id && styles.templateChipSelected]}
                      onPress={() => {
                        setSelectedTemplate(t.id);
                        setNewLabel(t.label);
                        setNewUnit(t.unit);
                        setNewMinValue(t.min.toString());
                        setNewMaxValue(t.max.toString());
                        setNewPin(t.pin);
                      }}
                    >
                      <Ionicons name={t.icon as any} size={16} color={selectedTemplate === t.id ? '#FFF' : COLORS.green} />
                      <Text style={[styles.templateChipText, selectedTemplate === t.id && styles.templateChipTextSelected]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom du composant</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Vanne Verger Nord"
                value={newLabel}
                onChangeText={setNewLabel}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            {activeTab === "capteurs" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Unité de mesure</Text>
                  <View style={styles.unitChips}>
                    {COMMON_UNITS.map(u => (
                      <TouchableOpacity 
                        key={u} 
                        style={[styles.unitChip, newUnit === u && styles.unitChipSelected]}
                        onPress={() => setNewUnit(u)}
                      >
                        <Text style={[styles.unitChipText, newUnit === u && styles.unitChipTextSelected]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                    <TextInput 
                      style={[styles.input, { flex: 1, minWidth: 80, height: 38, paddingVertical: 0 }]} 
                      placeholder="Autre..." 
                      value={COMMON_UNITS.includes(newUnit) ? "" : newUnit} 
                      onChangeText={setNewUnit} 
                      placeholderTextColor={COLORS.textSecondary} 
                    />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Valeur Min</Text>
                    <TextInput style={styles.input} placeholder="Ex: -10" keyboardType="numeric" value={newMinValue} onChangeText={setNewMinValue} placeholderTextColor={COLORS.textSecondary} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Valeur Max</Text>
                    <TextInput style={styles.input} placeholder="Ex: 50" keyboardType="numeric" value={newMaxValue} onChangeText={setNewMaxValue} placeholderTextColor={COLORS.textSecondary} />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sélectionnez le Pin</Text>
              <ScrollView style={styles.pinScroll} contentContainerStyle={styles.pinGrid}>
                {(activeTab === "capteurs" ? SENSOR_PINS : ACTUATOR_PINS).map(pin => (
                  <TouchableOpacity
                    key={pin.value}
                    style={[styles.pinChip, newPin === pin.value && styles.pinChipSelected]}
                    onPress={() => setNewPin(pin.value)}
                  >
                    <Text style={[styles.pinChipText, newPin === pin.value && styles.pinChipTextSelected]}>
                      {pin.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSubmit} onPress={handleAddComponent}>
                <Text style={styles.modalButtonTextSubmit}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100 }, // added bottom padding for FAB
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.tabInactiveBg,
    borderRadius: 24,
    padding: 4,
    marginTop: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.green,
  },
  listContainer: {
    marginTop: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6F1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#FFEBEB",
    borderRadius: 12,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 20,
    fontStyle: "italic"
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pageButtonDisabled: {
    backgroundColor: COLORS.tabInactiveBg,
    shadowOpacity: 0,
    elevation: 0,
  },
  pageText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F7F8F9",
    borderWidth: 1,
    borderColor: "#E8E0D8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  pinScroll: {
    maxHeight: 180,
    backgroundColor: "#F7F8F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0D8",
    padding: 8,
  },
  pinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pinChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E8E0D8",
  },
  pinChipSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  pinChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  pinChipTextSelected: {
    color: "#FFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F5F0EB",
    alignItems: "center",
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  modalButtonSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    alignItems: "center",
  },
  modalButtonTextSubmit: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },

  // --- NEW UX STYLES ---
  templateList: {
    marginBottom: 4,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F0F7F2',
    borderWidth: 1,
    borderColor: '#D4E8D9',
    marginRight: 8,
  },
  templateChipSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },
  templateChipTextSelected: {
    color: '#FFF',
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },
  unitChipSelected: {
    backgroundColor: '#EFF6F1',
    borderColor: COLORS.green,
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unitChipTextSelected: {
    color: COLORS.green,
  },
});
