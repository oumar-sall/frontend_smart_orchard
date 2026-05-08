import { useState, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { storage } from '@/utils/storage';

export function useSettings() {
  const router = useRouter();
  const [actuators, setActuators] = useState<any[]>([]);
  const [selectedPin, setSelectedPin] = useState('OUT 0');
  const [availableSensors, setAvailableSensors] = useState<any[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeController, setActiveController] = useState({ id: '', name: 'Galileosky Verger' });
  
  const [settings, setSettings] = useState({
    irrigation_duration: 900,
    reporting_interval: 30,
    threshold_min: 35.0,
    sensor_id: null as string | null,
    auto_mode: false,
  });

  const fetchSettings = useCallback(async (pin: string) => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      const response = await api.get(`/readings/settings`, {
        params: { pin, controller_id: controllerId }
      });
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          irrigation_duration: response.data.irrigation_duration ?? 900,
          reporting_interval: response.data.reporting_interval || prev.reporting_interval,
          threshold_min: response.data.threshold_min ?? 35.0,
          sensor_id: response.data.sensor_id ?? null,
          auto_mode: response.data.auto_mode ?? false,
        }));
      }
    } catch (error) {
      console.error("Erreur fetch settings: ", error);
    }
  }, [isLoggingOut]);

  const fetchAvailableSensors = useCallback(async () => {
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      const response = await api.get(`/readings/sensors`, {
        params: { controller_id: controllerId }
      });
      setAvailableSensors(response.data || []);
    } catch (error) {
      console.error("Erreur fetch sensors: ", error);
    }
  }, [isLoggingOut]);

  const updateSettingImmediate = useCallback(async (key: string, val: any, pin: string) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    try {
      const controllerId = await storage.getItem('selectedControllerId');
      if (!controllerId || isLoggingOut) return;
      await api.put(`/readings/settings`, { [key]: val, pin, controller_id: controllerId });
    } catch (error) {
      console.error("Erreur sync settings:", error);
    }
  }, [isLoggingOut]);

  const updateSettingDebounced = useRef(
    (() => {
      let timeout: any;
      return (key: string, val: any, pin: string) => {
        setSettings(prev => ({ ...prev, [key]: val }));
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const id = await storage.getItem('selectedControllerId');
          if (id) {
            api.put(`/readings/settings`, { [key]: val, pin, controller_id: id })
              .catch(err => console.error("Erreur debounce sync:", err));
          }
        }, 800);
      };
    })()
  ).current;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await Promise.all([
        storage.deleteItem('userToken'),
        storage.deleteItem('userData'),
        storage.deleteItem('selectedControllerId'),
        storage.deleteItem('selectedControllerName')
      ]);
      router.replace('/login');
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      setIsLoggingOut(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        try {
          const storedId = await storage.getItem('selectedControllerId');
          const storedName = await storage.getItem('selectedControllerName');
          if (storedId) setActiveController({ id: storedId, name: storedName || 'Contrôleur sans nom' });
          if (!storedId || isLoggingOut) return;

          const res = await api.get(`/readings/actuators`, { params: { controller_id: storedId } });
          setActuators(res.data);

          let pinToLoad = selectedPin;
          const exists = res.data.find((a: any) => a.pin_number === selectedPin);
          if (!exists && res.data.length > 0) {
            pinToLoad = res.data[0].pin_number;
            setSelectedPin(pinToLoad);
          }
          if (pinToLoad) fetchSettings(pinToLoad);
          fetchAvailableSensors();
        } catch (error) {
          console.error("Erreur refresh settings:", error);
        }
      };
      refresh();
    }, [selectedPin, fetchSettings, fetchAvailableSensors, isLoggingOut])
  );

  return {
    settings, actuators, selectedPin, setSelectedPin, availableSensors,
    activeController, handleLogout, fetchSettings,
    updateDuration: (val: number) => updateSettingDebounced('irrigation_duration', val * 60, selectedPin),
    updateThreshold: (val: number) => updateSettingDebounced('threshold_min', val, selectedPin),
    updateReporting: (val: number) => updateSettingDebounced('reporting_interval', val, selectedPin),
    updateSensor: (id: string) => updateSettingImmediate('sensor_id', id, selectedPin),
    updateAutoMode: (val: boolean) => updateSettingImmediate('auto_mode', val, selectedPin)
  };
}
