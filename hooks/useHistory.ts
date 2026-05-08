import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/utils/api';
import { storage } from '@/utils/storage';
import { APP_CONFIG } from '../constants/Config';

const ITEMS_PER_PAGE = APP_CONFIG.PAGINATION.ITEMS_PER_PAGE;

export function useHistory() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averages, setAverages] = useState({ temp: '--', hum: '--', ph: '--' });
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>(APP_CONFIG.HISTORY.DEFAULT_PERIOD as any);
  const [viewMode, setViewMode] = useState<'data' | 'logs' | 'charts'>('data');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [totalLogPages, setTotalLogPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await api.get(`/readings/history`, {
        params: { period: selectedPeriod, controller_id: controllerId }
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
      if (viewMode !== 'logs') setLoading(false);
    }
  }, [selectedPeriod, viewMode]);

  const fetchActivityLogs = useCallback(async () => {
    if (viewMode !== 'logs') return;
    setLoading(true);
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      const response = await api.get(`/activity-logs`, {
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

  // Derived chart data
  const humChartData = useMemo(() => historyData.map(d => ({
    value: d.avgHumidity === '--' ? 0 : d.avgHumidity,
    label: d.displayDate.split(' ')[0],
  })), [historyData]);

  const tempChartData = useMemo(() => historyData.map(d => ({
    value: d.avgTemperature === '--' ? 0 : d.avgTemperature,
    label: d.displayDate.split(' ')[0],
  })), [historyData]);

  // Derived pagination
  const paginatedHistory = historyData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalHistoryPages = Math.ceil(historyData.length / ITEMS_PER_PAGE) || 1;

  return {
    historyData: paginatedHistory, totalHistoryPages, currentPage, setCurrentPage,
    activityLogs, totalLogPages, logPage, setLogPage,
    loading, averages, selectedPeriod, setSelectedPeriod,
    viewMode, setViewMode, humChartData, tempChartData
  };
}
