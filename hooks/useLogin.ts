import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { logger } from '@/shared/logger';
import { API_URL } from '@/constants/Api';
import { defaultCountry, Country } from '@/constants/Countries';

export function useLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (!cleanPhone || cleanPhone.length < 8) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone valide');
      return;
    }

    const fullPhone = `${selectedCountry.callingCode}${cleanPhone}`;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await storage.setItem('userToken', data.token);
        await storage.setItem('userData', JSON.stringify(data.user));
        logger.info(`Connexion réussie pour ${fullPhone}`);
        
        if (!data.user.first_name || data.user.first_name === 'Nouveau') {
          router.replace('/register' as any);
        } else {
          router.replace('/controllers' as any);
        }
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de se connecter');
      }
    } catch (err: any) {
      logger.error('Erreur login:', err);
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const resetApp = async () => {
    await storage.clearAll();
    Alert.alert('Succès', 'Application réinitialisée.');
    router.replace('/login');
  };

  return {
    phone, setPhone,
    loading, handleLogin,
    selectedCountry, setSelectedCountry,
    isPickerVisible, setIsPickerVisible,
    resetApp
  };
}
