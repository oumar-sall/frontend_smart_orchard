import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../../components/AppHeader";
import ComponentModal from "../../components/ComponentModal";
import ComponentCard from "../../components/ComponentCard";
import Pagination from "../../components/Pagination";
import { useComponents } from "../../hooks/useComponents";

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
};

export default function ComposantsScreen() {
  const [activeTab, setActiveTab] = useState<"capteurs" | "actionneurs">("capteurs");
  
  const {
    sensors, totalSensorPages, sensorPage, setSensorPage,
    actuators, totalActuatorPages, actuatorPage, setActuatorPage,
    loading, usedPins, isModalVisible, setModalVisible,
    editingId, handleStartEdit, handleSave, handleDelete, resetForm,
    form
  } = useComponents(activeTab);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <AppHeader />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "capteurs" && styles.tabButtonActive]}
            onPress={() => { setActiveTab("capteurs"); setSensorPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === "capteurs" && styles.tabTextActive]}>Capteurs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "actionneurs" && styles.tabButtonActive]}
            onPress={() => { setActiveTab("actionneurs"); setActuatorPage(1); }}
          >
            <Text style={[styles.tabText, activeTab === "actionneurs" && styles.tabTextActive]}>Actionneurs</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {activeTab === "capteurs" ? (
              <>
                {sensors.length > 0 ? sensors.map(item => (
                  <ComponentCard key={item.id} item={item} type="capteurs" onEdit={handleStartEdit} onDelete={handleDelete} />
                )) : <Text style={styles.emptyText}>Aucun capteur trouvé.</Text>}
                <Pagination currentPage={sensorPage} totalPages={totalSensorPages} onPageChange={setSensorPage} />
              </>
            ) : (
              <>
                {actuators.length > 0 ? actuators.map(item => (
                  <ComponentCard key={item.id} item={item} type="actionneurs" onEdit={handleStartEdit} onDelete={handleDelete} />
                )) : <Text style={styles.emptyText}>Aucun actionneur trouvé.</Text>}
                <Pagination currentPage={actuatorPage} totalPages={totalActuatorPages} onPageChange={setActuatorPage} />
              </>
            )}
          </View>
        )}
      </ScrollView>

      {!loading && (
        <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}

      <ComponentModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        activeTab={activeTab}
        editingId={editingId}
        {...form}
        usedPins={usedPins}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 100 },
  tabContainer: { flexDirection: "row", backgroundColor: "#F0EAE4", borderRadius: 16, padding: 4, marginTop: 20, marginBottom: 24 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabButtonActive: { backgroundColor: "#FFFFFF", elevation: 3 },
  tabText: { fontSize: 13, fontWeight: "700", color: "#717171" },
  tabTextActive: { color: "#4A7C59" },
  listContainer: { marginTop: 8 },
  emptyText: { textAlign: "center", color: COLORS.textSecondary, marginTop: 20, fontStyle: "italic" },
  fab: { position: "absolute", right: 20, bottom: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.green, alignItems: "center", justifyContent: "center", elevation: 6 },
});
