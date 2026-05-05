import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';

interface ScannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}

export default function ScannerModal({ isVisible, onClose, onScanned }: ScannerModalProps) {
  const [torchEnabled, setTorchEnabled] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    onScanned(data);
  };

  return (
    <Modal visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr", "code128"] }}
          enableTorch={torchEnabled}
          zoom={0.1}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.focusedContainer}>
            <View style={styles.focusedItem} />
          </View>
          <View style={styles.unfocusedContainer} />
        </View>

        <View style={styles.scannerHeader}>
          <TouchableOpacity style={styles.closeScanner} onPress={onClose}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.scannerTitle}>Scanner le code IMEI</Text>
          <TouchableOpacity 
            style={styles.torchBtn} 
            onPress={() => setTorchEnabled(prev => !prev)}
          >
            <Ionicons 
              name={torchEnabled ? "flash" : "flash-outline"} 
              size={24} 
              color={torchEnabled ? "#FED330" : "white"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.scannerFooter}>
          <Text style={styles.scannerText}>Placez le code-barres dans le cadre</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scannerContainer: { flex: 1, backgroundColor: "black" },
  scannerHeader: { position: "absolute", top: 50, left: 0, right: 0, alignItems: "center", flexDirection: "row", paddingHorizontal: 20 },
  closeScanner: { padding: 10 },
  scannerTitle: { color: "white", fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  torchBtn: { padding: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20 },
  scannerFooter: { position: "absolute", bottom: 50, left: 0, right: 0, alignItems: "center" },
  scannerText: { color: "white", fontSize: 16, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  focusedContainer: { height: 250, flexDirection: 'row' },
  focusedItem: { flex: 1, borderWidth: 2, borderColor: '#FED330', backgroundColor: 'transparent', borderRadius: 15 },
});
