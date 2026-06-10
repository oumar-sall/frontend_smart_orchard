import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Theme';

interface AddControllerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScan: () => void;
  onSave: () => void;
  onLookup: () => void;
  onImeiChange: (text: string) => void;
  newController: any;
  setNewController: (v: any) => void;
  searchLoading: boolean;
  foundController: any;
  hasSearched: boolean;
  resendCountdown: number;
}

export default function AddControllerModal(props: AddControllerModalProps) {
  const {
    isVisible, onClose, onScan, onSave, onLookup, onImeiChange,
    newController, setNewController, searchLoading,
    foundController, hasSearched, resendCountdown
  } = props;

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Ajouter un Contrôleur</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputInContainer}
                  placeholder="IMEI du boitier"
                  keyboardType="numeric"
                  value={newController.imei}
                  onChangeText={onImeiChange}
                  onBlur={onLookup}
                  placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity style={styles.scanBtnInside} onPress={onScan}>
                  <Ionicons name="qr-code-outline" size={24} color={COLORS.green} />
                </TouchableOpacity>
              </View>

              {searchLoading && (
                <ActivityIndicator size="small" color={COLORS.green} style={{ marginBottom: 15 }} />
              )}

              {foundController && (
                <>
                  <View style={styles.foundInfo}>
                    <Ionicons
                      name={foundController.is_new ? "sparkles-outline" : "checkmark-circle"}
                      size={16} color={COLORS.green}
                    />
                    <Text style={styles.foundText}>
                      {foundController.is_new ? "Nouveau boitier détecté !" : `Existant : ${foundController.name}`}
                    </Text>
                  </View>

                  <View style={[styles.inputContainer, { marginTop: 15 }]}>
                    <TextInput
                      style={styles.inputInContainer}
                      placeholder="Nom (ex: Verger Nord)"
                      value={newController.name}
                      onChangeText={(text) => setNewController({ ...newController, name: text })}
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputInContainer}
                      placeholder="Code SMS à 6 chiffres"
                      keyboardType="numeric"
                      maxLength={6}
                      value={newController.join_otp}
                      onChangeText={(text) => setNewController({ ...newController, join_otp: text })}
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <View style={styles.pinIconContainer}>
                      <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.green} />
                    </View>
                  </View>

                  <View style={styles.resendContainer}>
                    {resendCountdown > 0 ? (
                      <Text style={styles.resendText}>
                        Renvoyer dans {Math.floor(resendCountdown / 60)}:{(resendCountdown % 60).toString().padStart(2, '0')}
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={onLookup}>
                        <Text style={styles.resendBtnText}>Je n&apos;ai pas reçu le code (Renvoyer)</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              {!foundController && hasSearched && !searchLoading && (
                <View style={styles.notFoundContainer}>
                  <Ionicons name="cloud-offline-outline" size={32} color={COLORS.danger} />
                  <Text style={styles.notFoundText}>Boitier introuvable ou hors ligne.</Text>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.addBtn, !foundController && styles.buttonDisabled]}
                  onPress={onSave}
                  disabled={!foundController}
                >
                  <Text style={styles.addText}>{foundController?.is_new ? "Créer" : "Rejoindre"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalView: { width: "85%", backgroundColor: "white", borderRadius: 28, padding: 25, alignItems: "center", elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: COLORS.textPrimary, textTransform: 'uppercase' },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10, gap: 12 },
  button: { flex: 1, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  cancelBtn: { backgroundColor: COLORS.background },
  addBtn: { backgroundColor: COLORS.green },
  cancelText: { color: COLORS.textPrimary, fontWeight: "700" },
  addText: { color: "white", fontWeight: "800" },
  buttonDisabled: { backgroundColor: COLORS.inactive, opacity: 0.6 },
  inputContainer: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 15 },
  inputInContainer: { height: 50, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 15, fontSize: 16, flex: 1, backgroundColor: '#f9f9f9', color: COLORS.textPrimary },
  scanBtnInside: { padding: 10, marginLeft: 8, backgroundColor: '#EFF6F1', borderRadius: 12, borderWidth: 1, borderColor: '#D4E8D9' },
  foundInfo: { flexDirection: "row", alignItems: "center", backgroundColor: "#EAF2EC", padding: 10, borderRadius: 12, width: '100%' },
  foundText: { marginLeft: 8, color: COLORS.green, fontSize: 13, fontWeight: "700" },
  pinIconContainer: { padding: 10, marginLeft: 8, backgroundColor: '#EFF6F1', borderRadius: 12 },
  resendContainer: { width: "100%", alignItems: "center", marginBottom: 20 },
  resendText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic" },
  resendBtnText: { fontSize: 12, color: COLORS.green, fontWeight: "bold", textDecorationLine: "underline" },
  notFoundContainer: { alignItems: 'center', padding: 10 },
  notFoundText: { color: COLORS.danger, fontSize: 14, fontWeight: '700', marginTop: 5 },
});
