import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { storage } from '@/utils/storage';
import { logger } from '@/shared/logger';

export function useRegister() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreedToCGU, setAgreedToCGU] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!agreedToCGU) {
      Alert.alert('Erreur', 'Vous devez accepter les conditions générales d\'utilisation');
      return;
    }

    setLoading(true);
    try {
      // On utilise l'instance 'api' qui gère déjà le token
      const response = await api.put(`/auth/update-profile`, {
        first_name: firstName,
        last_name: lastName
      });

      if (response.data.user) {
        await storage.setItem('userData', JSON.stringify(response.data.user));
        
        Alert.alert('Succès', 'Profil complété avec succès !', [
          { text: 'Continuer', onPress: () => router.replace('/controllers' as any) }
        ]);
      }
    } catch (err: any) {
      logger.error('Erreur inscription:', err);
      Alert.alert('Erreur', err.response?.data?.error || 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName, setFirstName,
    lastName, setLastName,
    agreedToCGU, setAgreedToCGU,
    loading, handleRegister
  };
}
