import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { COLORS } from "../../constants/Theme";
import ScannerModal from "../../components/ScannerModal";
import AddControllerModal from "../../components/AddControllerModal";
import { useControllers } from "../../hooks/useControllers";

export default function ControllerListScreen() {
  const router = useRouter();
  const {
    controllers, loading, searchQuery, setSearchQuery, fetchControllers,
    selectController, lookupImei, addController, handleScanned, handleImeiChange,
    modalVisible, setModalVisible, scanning, setScanning,
    searchLoading, foundController, newController, setNewController,
    hasSearched, resendCountdown
  } = useControllers();

  useFocusEffect(
    useCallback(() => {
      fetchControllers();
    }, [fetchControllers])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => selectController(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name="hardware-chip-outline" size={24} color={COLORS.green} />
        </View>
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
          <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
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
            <Ionicons name="person-circle-outline" size={36} color={COLORS.green} />
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
            placeholderTextColor={COLORS.textSecondary}
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

      <AddControllerModal 
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScan={() => { setModalVisible(false); setScanning(true); }}
        onSave={addController}
        onLookup={lookupImei}
        onImeiChange={handleImeiChange}
        newController={newController}
        setNewController={setNewController}
        searchLoading={searchLoading}
        foundController={foundController}
        hasSearched={hasSearched}
        resendCountdown={resendCountdown}
      />

      <ScannerModal 
        isVisible={scanning}
        onClose={() => { setScanning(false); setModalVisible(true); }}
        onScanned={handleScanned}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  profileBtn: { padding: 4 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500' },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card,
    borderRadius: 16, paddingHorizontal: 16, marginTop: 20, height: 50,
    borderWidth: 1, borderColor: '#eee', elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  loader: { marginTop: 50 },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
    marginBottom: 16, elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 48, height: 48, backgroundColor: '#EAF2EC', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 16 },
  name: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  imei: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  settingsBtn: { padding: 10, borderRadius: 12, backgroundColor: "#F8F9FA" },
  fab: {
    position: "absolute", bottom: 30, right: 30, backgroundColor: COLORS.green,
    width: 64, height: 64, borderRadius: 32, justifyContent: "center",
    alignItems: "center", elevation: 8, shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  emptyContainer: { alignItems: "center", marginTop: 100, opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
});
