import React from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from "../../components/AppHeader";
import HistoryCard from "../../components/HistoryCard";
import ActivityLogCard from "../../components/ActivityLogCard";
import HistoryChart from "../../components/HistoryChart";
import SummaryCard from "../../components/SummaryCard";
import Pagination from "../../components/Pagination";
import { useHistory } from "../../hooks/useHistory";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/Theme";

export default function HistoriqueScreen() {
  const router = useRouter();
  const {
    historyData, totalHistoryPages, currentPage, setCurrentPage,
    activityLogs, totalLogPages, logPage, setLogPage,
    loading, averages, selectedPeriod, setSelectedPeriod,
    viewMode, setViewMode, humChartData, tempChartData,
    selectedDate, setSelectedDate
  } = useHistory();

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader />

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        </View>

        <View style={styles.viewToggleRow}>
          {['data', 'charts', 'logs'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.viewToggleBtn, viewMode === mode && styles.viewToggleBtnActive]}
              onPress={() => mode === 'logs' ? (setViewMode('logs'), setLogPage(1)) : setViewMode(mode as any)}
            >
              <Text style={viewMode === mode ? styles.viewToggleTextActive : styles.viewToggleText}>
                {mode === 'data' ? 'Données' : mode === 'charts' ? 'Graphes' : 'Journal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(viewMode === 'data' || viewMode === 'charts') && (
          <View style={styles.summaryRow}>
            <SummaryCard title="MOY. HUMID." value={averages.hum} unit="%" icon="water-outline" color="#4A90E2" />
            <SummaryCard title="MOY. PH" value={averages.ph} icon="flask-outline" color="#9B51E0" />
            <SummaryCard title="MOY. TEMP." value={averages.temp} unit="°" icon="thermometer-outline" color="#F2994A" />
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {viewMode === 'data' ? 'RÉSUMÉ' : viewMode === 'charts' ? 'STATISTIQUES' : 'ACTIVITÉS'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {viewMode === 'logs' && (
              <TouchableOpacity
                style={[styles.sortButton, selectedDate && { borderColor: COLORS.green, backgroundColor: '#EAF2EC' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={12} color={selectedDate ? COLORS.green : "#77967C"} style={{ marginRight: 6 }} />
                <Text style={[styles.sortButtonText, selectedDate && { color: COLORS.green }]}>
                  {selectedDate ? selectedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Date'}
                </Text>
                {selectedDate && (
                  <TouchableOpacity onPress={() => setSelectedDate(null)} style={{ marginLeft: 6 }}>
                    <Ionicons name="close-circle" size={14} color={COLORS.green} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.sortButton} onPress={() => setSelectedPeriod(selectedPeriod === 'week' ? 'month' : 'week')}>
              <Ionicons name="funnel-outline" size={12} color="#77967C" style={{ marginRight: 6 }} />
              <Text style={styles.sortButtonText}>{selectedPeriod === 'week' ? 'Semaine' : 'Mois'}</Text>
              <Ionicons name="chevron-down" size={12} color="#77967C" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        ) : (
          <>
            {viewMode === 'data' && (
              <>
                {historyData.map((day) => (
                  <HistoryCard key={day.date} {...day} />
                ))}
                {totalHistoryPages > 1 && (
                  <Pagination currentPage={currentPage} totalPages={totalHistoryPages} onPageChange={setCurrentPage} />
                )}
              </>
            )}

            {viewMode === 'charts' && (
              <View style={{ gap: 10 }}>
                <HistoryChart title="Humidité" data={humChartData} color="#4A90E2" unit="%" icon="water-outline" />
                <HistoryChart title="Température" data={tempChartData} color="#F2994A" unit="°" icon="thermometer-outline" />
              </View>
            )}

            {viewMode === 'logs' && (
              <>
                {activityLogs.map((log) => (
                  <ActivityLogCard
                    key={log.id}
                    type={log.event_type}
                    description={log.description}
                    timestamp={log.timestamp}
                    userName={log.User ? `${log.User.first_name} ${log.User.last_name}` : undefined}
                    onPress={() => router.push(`/activities/${log.id}`)}
                  />
                ))}
                {totalLogPages > 1 && (
                  <Pagination currentPage={logPage} totalPages={totalLogPages} onPageChange={setLogPage} />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F0EB" },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  titleRow: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#8E8E93", letterSpacing: 1.2, textTransform: 'uppercase' },
  sortButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F0EAE4', elevation: 2 },
  sortButtonText: { fontSize: 12, fontWeight: '800', color: '#4A7C59', textTransform: 'uppercase' },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  viewToggleRow: { flexDirection: "row", backgroundColor: "#F0EAE4", borderRadius: 16, padding: 4, marginBottom: 24 },
  viewToggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12 },
  viewToggleBtnActive: { backgroundColor: "#FFFFFF", elevation: 3 },
  viewToggleText: { fontSize: 13, fontWeight: "600", color: "#717171" },
  viewToggleTextActive: { fontSize: 13, fontWeight: "700", color: "#4A7C59" },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontSize: 13, fontWeight: "700", color: "#8E8E93", letterSpacing: 0.5 },
});
