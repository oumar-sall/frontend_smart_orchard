import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { storage } from "@/utils/storage";
import api from "@/utils/api";
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
  { value: "485 A", label: "485 A" },
  { value: "485 B", label: "485 B" },
];

const ACTUATOR_PINS = [
  { value: "OUT 0", label: "OUT 0" },
  { value: "OUT 1", label: "OUT 1" },
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

  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

  const usedPins = React.useMemo(() => {
    const pins = new Set<string>();
    sensors.forEach(s => { if (s.id !== editingComponentId) pins.add(s.pin_number); });
    actuators.forEach(a => { if (a.id !== editingComponentId) pins.add(a.pin_number); });
    return pins;
  }, [sensors, actuators, editingComponentId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const params = { controller_id: controllerId };

      const [resSensors, resActuators] = await Promise.all([
        api.get(`/readings/sensors`, { params }),
        api.get(`/readings/actuators`, { params })
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

  const handleStartEdit = (item: any) => {
    setEditingComponentId(item.id);
    setNewLabel(item.label || "");
    setNewPin(item.pin_number || "");
    setNewUnit(item.unit || "");
    setNewMinValue(item.min_value?.toString() || "");
    setNewMaxValue(item.max_value?.toString() || "");

    // Auto-detect template if possible (simple heuristic)
    const t = SENSOR_TEMPLATES.find(tmp => tmp.label === item.label);
    setSelectedTemplate(t ? t.id : null);

    setModalVisible(true);
  };

  const handleSaveComponent = async () => {
    if (!newLabel.trim() || !newPin.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const data = {
        label: newLabel,
        pin_number: newPin,
        unit: newUnit || undefined,
        min_value: newMinValue ? parseFloat(newMinValue) : undefined,
        max_value: newMaxValue ? parseFloat(newMaxValue) : undefined,
        controller_id: controllerId
      };

      if (editingComponentId) {
        await api.put(`/readings/components/${editingComponentId}`, data);
      } else {
        await api.post(`/readings/components`, {
          ...data,
          type: activeTab === 'capteurs' ? 'sensor' : 'actuator',
        });
      }

      setModalVisible(false);
      setEditingComponentId(null);
      setNewLabel("");
      setNewPin("");
      setNewUnit("");
      setNewMinValue("");
      setNewMaxValue("");

      fetchData();
      Alert.alert("Succès", editingComponentId ? "Composant mis à jour" : "Composant ajouté");
    } catch (error: any) {
      console.error("Erreur sauvegarde composant:", error);
      Alert.alert("Erreur", error?.response?.data?.error || "Impossible d'enregistrer le composant");
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
              await api.delete(`/readings/components/${id}`);

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
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleStartEdit(item)}>
          <Ionicons name="pencil-outline" size={20} color={COLORS.green} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComponent(item.id)}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
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
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleStartEdit(item)}>
            <Ionicons name="pencil-outline" size={20} color={COLORS.green} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteComponent(item.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
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
            {activeTab !== "capteurs" && (
              <Ionicons name="hardware-chip-outline" size={14} color="#717171" style={{ marginRight: 6 }} />
            )}
            <Text style={[styles.tabText, activeTab === "capteurs" && styles.tabTextActive]}>
              Capteurs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "actionneurs" && styles.tabButtonActive]}
            onPress={() => { setActiveTab("actionneurs"); setActuatorPage(1); }}
          >
            {activeTab !== "actionneurs" && (
              <Ionicons name="construct-outline" size={14} color="#717171" style={{ marginRight: 6 }} />
            )}
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
          setEditingComponentId(null);
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

      {/* Adding/Editing Component Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingComponentId ? "Modifier" : "Ajouter"} un {activeTab === "capteurs" ? "capteur" : "actionneur"}
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
                    {(activeTab === "capteurs" ? SENSOR_PINS : ACTUATOR_PINS).map(pin => {
                      const isUsed = usedPins.has(pin.value);
                      return (
                        <TouchableOpacity
                          key={pin.value}
                          style={[
                            styles.pinChip,
                            newPin === pin.value && styles.pinChipSelected,
                            isUsed && styles.pinChipDisabled
                          ]}
                          onPress={() => !isUsed && setNewPin(pin.value)}
                          disabled={isUsed && newPin !== pin.value}
                        >
                          <Text style={[
                            styles.pinChipText,
                            newPin === pin.value && styles.pinChipTextSelected,
                            isUsed && styles.pinChipTextDisabled
                          ]}>
                            {pin.label}
                          </Text>
                          {isUsed && <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonSubmit} onPress={handleSaveComponent}>
                    <Text style={styles.modalButtonTextSubmit}>
                      {editingComponentId ? "Enregistrer" : "Ajouter"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0EAE4",
    borderRadius: 16,
    padding: 4,
    marginTop: 20,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#717171",
  },
  tabTextActive: {
    color: "#4A7C59",
  },
  listContainer: {
    marginTop: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
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
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  editButton: {
    padding: 10,
    backgroundColor: "#EFF6F1",
    borderRadius: 12,
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
    fontStyle: "italic",
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0EAE4',
  },
  pageButtonDisabled: {
    backgroundColor: "#F0EAE4",
    borderColor: "#F0EAE4",
    shadowOpacity: 0,
    elevation: 0,
  },
  pageText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 24,
    textAlign: "center",
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F7F8F9",
    borderWidth: 1,
    borderColor: "#F0EAE4",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pinScroll: {
    maxHeight: 180,
    backgroundColor: "#F7F8F9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0EAE4",
    padding: 8,
  },
  pinGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pinChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F0EAE4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pinChipSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  pinChipDisabled: {
    backgroundColor: "#EEE",
    borderColor: "#DDD",
    opacity: 0.6,
  },
  pinChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
  pinChipTextSelected: {
    color: "#FFF",
  },
  pinChipTextDisabled: {
    color: "#999",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#F5F0EB",
    alignItems: "center",
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalButtonSubmit: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: "center",
  },
  modalButtonTextSubmit: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
  },

  // --- NEW UX STYLES ---
  templateList: {
    marginBottom: 4,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EFF6F1',
    borderWidth: 1,
    borderColor: '#D4E8D9',
    marginRight: 10,
  },
  templateChipSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  templateChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.green,
  },
  templateChipTextSelected: {
    color: '#FFF',
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: "#F0EAE4",
  },
  unitChipSelected: {
    backgroundColor: '#EFF6F1',
    borderColor: COLORS.green,
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  unitChipTextSelected: {
    color: COLORS.green,
  },
});
