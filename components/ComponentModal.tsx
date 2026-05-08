import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/Theme";
import { HARDWARE_CONFIG, SENSOR_UNITS } from "../constants/Hardware";

const SENSOR_PINS = HARDWARE_CONFIG.GALILEOSKY.SENSOR_PINS;
const ACTUATOR_PINS = HARDWARE_CONFIG.GALILEOSKY.ACTUATOR_PINS;

const SENSOR_TEMPLATES = [
  { id: 'temp', label: 'Température', unit: '°C', min: -10, max: 50, pin: '485 A', icon: 'thermometer-outline' },
  { id: 'hum', label: 'Humidité', unit: '%', min: 0, max: 100, pin: '485 B', icon: 'water-outline' },
  { id: 'ph', label: 'pH Sol', unit: 'pH', min: 0, max: 14, pin: 'ph', icon: 'flask-outline' },
];

interface ComponentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  activeTab: 'capteurs' | 'actionneurs';
  editingId: string | null;

  // States passed from parent
  label: string; setLabel: (v: string) => void;
  pin: string; setPin: (v: string) => void;
  unit: string; setUnit: (v: string) => void;
  minVal: string; setMinVal: (v: string) => void;
  maxVal: string; setMaxVal: (v: string) => void;
  vMin: string; setVmin: (v: string) => void;
  vMax: string; setVmax: (v: string) => void;
  modbusTag: string; setModbusTag: (v: string) => void;
  selectedTemplate: string | null; setSelectedTemplate: (v: string | null) => void;
  usedPins: Set<string>;
}

export default function ComponentModal(props: ComponentModalProps) {
  const {
    isVisible, onClose, onSave, activeTab, editingId,
    label, setLabel, pin, setPin, unit, setUnit,
    minVal, setMinVal, maxVal, setMaxVal, vMin, setVmin, vMax, setVmax,
    modbusTag, setModbusTag, selectedTemplate, setSelectedTemplate,
    usedPins
  } = props;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Modifier" : "Ajouter"} un {activeTab === "capteurs" ? "capteur" : "actionneur"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
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
                          setLabel(t.label);
                          setUnit(t.unit);
                          setMinVal(t.min.toString());
                          setMaxVal(t.max.toString());
                          setPin(t.pin);
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
                  value={label}
                  onChangeText={setLabel}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              {activeTab === "capteurs" && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Unité de mesure</Text>
                    <View style={styles.unitChips}>
                      {SENSOR_UNITS.map(u => (
                        <TouchableOpacity
                          key={u}
                          style={[styles.unitChip, unit === u && styles.unitChipSelected]}
                          onPress={() => setUnit(u)}
                        >
                          <Text style={[styles.unitChipText, unit === u && styles.unitChipTextSelected]}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                      <TextInput
                        style={[styles.input, { flex: 1, minWidth: 80, height: 38, paddingVertical: 0 }]}
                        placeholder="Autre..."
                        value={SENSOR_UNITS.includes(unit) ? "" : unit}
                        onChangeText={setUnit}
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Valeur Min (Pmin)</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={minVal} onChangeText={setMinVal} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Valeur Max (Pmax)</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={maxVal} onChangeText={setMaxVal} />
                    </View>
                  </View>

                  {(pin.startsWith('IN ') || pin.startsWith('VOL ')) && (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Tension Min (Vmin)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={vMin} onChangeText={setVmin} />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Tension Max (Vmax)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={vMax} onChangeText={setVmax} />
                      </View>
                    </View>
                  )}

                  {pin.startsWith('485') && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>ID Modbus (Tag configuré)</Text>
                      <TextInput style={styles.input} keyboardType="numeric" value={modbusTag} onChangeText={setModbusTag} />
                    </View>
                  )}
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sélectionnez le Pin</Text>
                <ScrollView style={styles.pinScroll} contentContainerStyle={styles.pinGrid}>
                  {(activeTab === "capteurs" ? SENSOR_PINS : ACTUATOR_PINS).map(p => {
                    const isUsed = usedPins.has(p.value);
                    return (
                      <TouchableOpacity
                        key={p.value}
                        style={[styles.pinChip, pin === p.value && styles.pinChipSelected, isUsed && styles.pinChipDisabled]}
                        onPress={() => !isUsed && setPin(p.value)}
                        disabled={isUsed && pin !== p.value}
                      >
                        <Text style={[styles.pinChipText, pin === p.value && styles.pinChipTextSelected, isUsed && styles.pinChipTextDisabled]}>{p.label}</Text>
                        {isUsed && <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSubmit} onPress={onSave}>
                <Text style={styles.modalButtonTextSubmit}>{editingId ? "Enregistrer" : "Ajouter"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { width: '90%', maxHeight: '85%', backgroundColor: "#FFF", borderRadius: 28, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary, marginBottom: 24, textAlign: "center", textTransform: 'uppercase' },
  modalScrollView: { width: '100%' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: "800", color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: "#F7F8F9", borderWidth: 1, borderColor: "#F0EAE4", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  templateList: { marginBottom: 4 },
  templateChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#EFF6F1', borderWidth: 1, borderColor: '#D4E8D9', marginRight: 10 },
  templateChipSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  templateChipText: { fontSize: 13, fontWeight: '700', color: COLORS.green },
  templateChipTextSelected: { color: '#FFF' },
  unitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F7F8F9', borderWidth: 1, borderColor: '#F0EAE4' },
  unitChipSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  unitChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  unitChipTextSelected: { color: '#FFF' },
  pinScroll: { maxHeight: 180, backgroundColor: "#F7F8F9", borderRadius: 14, borderWidth: 1, borderColor: "#F0EAE4", padding: 8 },
  pinGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pinChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#F0EAE4", flexDirection: "row", alignItems: "center" },
  pinChipSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  pinChipDisabled: { backgroundColor: "#EEE", opacity: 0.6 },
  pinChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "700" },
  pinChipTextSelected: { color: "#FFF" },
  pinChipTextDisabled: { color: "#999" },
  modalButtons: { flexDirection: "row", gap: 16, marginTop: 12 },
  modalButtonCancel: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: "#F5F0EB", alignItems: "center" },
  modalButtonTextCancel: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary },
  modalButtonSubmit: { flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: COLORS.green, alignItems: "center" },
  modalButtonTextSubmit: { fontSize: 15, fontWeight: "800", color: "#FFF" },
});
