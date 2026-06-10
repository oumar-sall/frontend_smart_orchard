import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import api from '@/utils/api';
import { storage } from '@/utils/storage';
import { logger } from '@/shared/logger';

export function useControllers() {
  const router = useRouter();
  const [controllers, setControllers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundController, setFoundController] = useState<any | null>(null);
  const [newController, setNewController] = useState({ name: '', imei: '', join_otp: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const fetchControllers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/controllers`);
      setControllers(response.data || []);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await storage.clearAll();
        router.replace("/login");
      } else {
        setControllers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchControllers();
  }, [fetchControllers]);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const selectController = async (controller: any) => {
    try {
      await storage.setItem('selectedControllerId', controller.id);
      await storage.setItem('selectedControllerName', controller.name);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner le contrôleur");
    }
  };

  const handleImeiChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setNewController(prev => ({ ...prev, imei: cleanText }));

    // Auto-lookup si l'IMEI semble complet (GalileoSky utilise souvent 15 chiffres)
    if (cleanText.length >= 15) {
      lookupImei(cleanText);
    }
  };

  const lookupImei = async (overrideImei?: string) => {
    // Guard: onBlur passes a NativeSyntheticEvent, not a string — ignore it
    const safeOverride = typeof overrideImei === 'string' ? overrideImei : undefined;
    const imei = (safeOverride || newController.imei)?.trim();
    if (!imei) return;

    setSearchLoading(true);
    setFoundController(null);
    setHasSearched(true);
    try {
      const response = await api.get(`/controllers/search?imei=${imei}`);
      setFoundController(response.data);
      setNewController(prev => ({ ...prev, imei, name: response.data.name || '' }));

      if (response.data.sms_sent || response.data.debug_otp) {
        setResendCountdown(60);
      }

      if (response.data.sms_sent) {
        Alert.alert("Sécurité", "Un code de vérification a été envoyé par SMS.");
      } else if (response.data.debug_otp) {
        Alert.alert("Mode Développement", `Code test : ${response.data.debug_otp}`);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) logger.error("Erreur lookup imei:", error);
      setFoundController(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const addController = async () => {
    if (!newController.name || !newController.imei) {
      Alert.alert("Erreur", "Nom et IMEI requis");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/controllers`, newController);
      setModalVisible(false);
      setNewController({ name: '', imei: '', join_otp: '' });
      setFoundController(null);
      await fetchControllers();
      Alert.alert("Succès", foundController?.is_new ? "Contrôleur créé" : "Contrôleur rejoint");
    } catch (error: any) {
      logger.error("Erreur addController:", error);
      Alert.alert("Erreur", error.response?.data?.error || "Impossible d'opérer");
    } finally {
      setLoading(false);
    }
  };

  const handleScanned = (data: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(false);
    const cleanImei = data?.trim();
    setNewController(prev => ({ ...prev, imei: cleanImei }));
    setModalVisible(true);
    if (cleanImei) lookupImei(cleanImei);
  };

  return {
    controllers, loading, searchQuery, setSearchQuery, fetchControllers,
    selectController, lookupImei, addController, handleScanned, handleImeiChange,
    modalVisible, setModalVisible, scanning, setScanning,
    searchLoading, foundController, newController, setNewController,
    hasSearched, resendCountdown
  };
}
