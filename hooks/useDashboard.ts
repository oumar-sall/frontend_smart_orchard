import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { storage } from '@/utils/storage';

export function useDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>({ sensors: [], actuators: [] });
  const [externalTemp, setExternalTemp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [irrigationLoadingId, setIrrigationLoadingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId) {
        router.replace("/controllers" as any);
        return;
      }

      const response = await api.get(`/readings/dashboard`, {
        params: { controller_id: controllerId }
      });
      setData(response.data);
    } catch (error) {
      console.error("Erreur récupération données dashboard: ", error);
    }
  }, [router]);

  const fetchExternalTemp = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_weather=true`);
      if (weatherRes.data && weatherRes.data.current_weather) {
        setExternalTemp(weatherRes.data.current_weather.temperature);
      }
    } catch (err) {
      console.error("Erreur météo externe: ", err);
    }
  };

  const handleToggleIrrigation = async (componentId: string, action: string) => {
    setIrrigationLoadingId(componentId);
    try {
      const response = await api.post(`/readings/irrigation`, { action, componentId });
      if (response.data.success) {
        await fetchDashboardData();
        Alert.alert("Succès", `Commande ${action === 'open' ? 'ouverte' : 'fermée'} envoyée.`);
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Erreur lors de la commande");
    } finally {
      setIrrigationLoadingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchExternalTemp();
      await fetchDashboardData();
      setLoading(false);
    };
    loadAll();

    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    data,
    externalTemp,
    loading,
    irrigationLoadingId,
    handleToggleIrrigation,
    refresh: fetchDashboardData
  };
}
