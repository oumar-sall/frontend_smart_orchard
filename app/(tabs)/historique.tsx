import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { storage } from "@/utils/storage";
import AppHeader from "../../components/AppHeader";
import HistoryCard from "../../components/HistoryCard";
import ActivityLogCard from "../../components/ActivityLogCard";
import { API_URL } from "@/constants/Api";

const { width } = Dimensions.get('window');
const SUMMARY_CARD_WIDTH = (width - 56) / 3;

const COLORS = {
  background: "#F5F0EB",
  card: "#FFFFFF",
  green: "#4A7C59",
  textPrimary: "#1A1A1A",
  textSecondary: "#717171",
  activeGreen: "#4A7C59",
  inactiveBtn: "#FFFFFF",
};
const ITEMS_PER_PAGE = 7;

function SummaryCard({ title, value, unit, icon, color }: { title: string, value: string | number, unit?: string, icon: string, color: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>{String(value)}{unit}</Text>
      <Text style={styles.summaryLabel}>{title}</Text>
    </View>
  );
}

export default function HistoriqueScreen() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState({ temp: '--', hum: '--', ph: '--' });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [viewMode, setViewMode] = useState<'data' | 'logs'>('data');
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await axios.get(`${API_URL}/readings/history`, {
        params: { 
          period: selectedPeriod,
          controller_id: controllerId
        }
      });
      setHistoryData(response.data);
      setCurrentPage(1); 

      const data = response.data;
      if (data.length > 0) {
        const validTemp = data.filter((d: any) => d.avgTemperature !== '--').map((d: any) => d.avgTemperature);
        const validHum = data.filter((d: any) => d.avgHumidity !== '--').map((d: any) => d.avgHumidity);
        const validPh = data.filter((d: any) => d.avgPh !== '--').map((d: any) => parseFloat(d.avgPh));

        setAverages({
          temp: validTemp.length ? String(Math.round(validTemp.reduce((a: any, b: any) => a + b, 0) / validTemp.length)) : '--',
          hum: validHum.length ? String(Math.round(validHum.reduce((a: any, b: any) => a + b, 0) / validHum.length)) : '--',
          ph: validPh.length ? (validPh.reduce((a: any, b: any) => a + b, 0) / validPh.length).toFixed(1) : '--'
        });
      }
    } catch (error) {
      console.error("Erreur récupération historique: ", error);
    } finally {
      if (viewMode === 'data') setLoading(false);
    }
  }, [selectedPeriod, viewMode]);

  const fetchActivityLogs = useCallback(async () => {
    if (viewMode !== 'logs') return;
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await axios.get(`${API_URL}/activity-logs`, {
        params: {
          controller_id: controllerId,
          period: selectedPeriod,
          page: logPage,
          limit: ITEMS_PER_PAGE
        }
      });
      setActivityLogs(response.data.logs);
      setTotalLogPages(response.data.totalPages);
    } catch (error) {
      console.error("Erreur récupération logs: ", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, viewMode, logPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        </View>

        <View style={styles.viewToggleRow}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'data' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('data')}
          >
            {viewMode !== 'data' && (
              <Ionicons name="stats-chart" size={14} color="#717171" style={{ marginRight: 6 }} />
            )}
            <Text style={viewMode === 'data' ? styles.viewToggleTextActive : styles.viewToggleText}>Données</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'logs' && styles.viewToggleBtnActive]}
            onPress={() => {
              setViewMode('logs');
              setLogPage(1);
            }}
          >
            {viewMode !== 'logs' && (
              <Ionicons name="list" size={16} color="#717171" style={{ marginRight: 6 }} />
            )}
            <Text style={viewMode === 'logs' ? styles.viewToggleTextActive : styles.viewToggleText}>Journal</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'data' && (
          <View style={styles.summaryRow}>
            <SummaryCard
              title="MOY. HUMID."
              value={averages.hum}
              unit="%"
              icon="water-outline"
              color="#4A90E2"
            />
            <SummaryCard
              title="MOY. PH"
              value={averages.ph}
              icon="flask-outline"
              color="#9B51E0"
            />
            <SummaryCard
              title="MOY. TEMP."
              value={averages.temp}
              unit="°"
              icon="thermometer-outline"
              color="#F2994A"
            />
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {viewMode === 'data' ? 'RÉSUMÉ' : 'ACTIVITÉS'}
          </Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSelectedPeriod(selectedPeriod === 'week' ? 'month' : 'week')}
          >
            <Ionicons name="funnel-outline" size={12} color="#77967C" style={{ marginRight: 6 }} />
            <Text style={styles.sortButtonText}>
              {selectedPeriod === 'week' ? 'Semaine' : 'Mois'}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#77967C" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.green} style={{ marginTop: 40 }} />
        ) : (
          <>
            {viewMode === 'data' ? (
              <>
                {historyData
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((day) => (
                    <HistoryCard
                      key={day.date}
                      displayDate={day.displayDate}
                      avgHumidity={day.avgHumidity}
                      avgPh={day.avgPh}
                      avgTemperature={day.avgTemperature}
                      wateringCount={day.wateringCount}
                      humidityTrend={day.humidityTrend}
                    />
                  ))
                }
                
                {historyData.length > ITEMS_PER_PAGE && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                      disabled={currentPage === 1}
                      onPress={() => setCurrentPage(prev => prev - 1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? COLORS.textSecondary : COLORS.textPrimary} />
                    </TouchableOpacity>

                    <Text style={styles.pageText}>Page {currentPage} / {Math.ceil(historyData.length / ITEMS_PER_PAGE)}</Text>

                    <TouchableOpacity
                      style={[styles.pageButton, currentPage === Math.ceil(historyData.length / ITEMS_PER_PAGE) && styles.pageButtonDisabled]}
                      disabled={currentPage === Math.ceil(historyData.length / ITEMS_PER_PAGE)}
                      onPress={() => setCurrentPage(prev => prev + 1)}
                    >
                      <Ionicons name="chevron-forward" size={20} color={currentPage === Math.ceil(historyData.length / ITEMS_PER_PAGE) ? COLORS.textSecondary : COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                {activityLogs.map((log) => (
                  <ActivityLogCard
                    key={log.id}
                    type={log.event_type}
                    description={log.description}
                    timestamp={log.timestamp}
                  />
                ))}
                
                {totalLogPages > 1 && (
                  <View style={styles.paginationContainer}>
                    <TouchableOpacity
                      style={[styles.pageButton, logPage === 1 && styles.pageButtonDisabled]}
                      disabled={logPage === 1}
                      onPress={() => setLogPage(prev => prev - 1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={logPage === 1 ? COLORS.textSecondary : COLORS.textPrimary} />
                    </TouchableOpacity>

                    <Text style={styles.pageText}>Page {logPage} / {totalLogPages}</Text>

                    <TouchableOpacity
                      style={[styles.pageButton, logPage === totalLogPages && styles.pageButtonDisabled]}
                      disabled={logPage === totalLogPages}
                      onPress={() => setLogPage(prev => prev + 1)}
                    >
                      <Ionicons name="chevron-forward" size={20} color={logPage === totalLogPages ? COLORS.textSecondary : COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
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

  titleRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0EAE4',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4A7C59',
    textTransform: 'uppercase',
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 12,
    width: SUMMARY_CARD_WIDTH,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // View Toggle (Segmented Control)
  viewToggleRow: {
    flexDirection: "row",
    backgroundColor: "#F0EAE4",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewToggleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#717171",
  },
  viewToggleTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A7C59",
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  
  // Pagination
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
});
