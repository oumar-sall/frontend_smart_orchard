import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { storage } from '@/utils/storage';

export function useProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUser = useCallback(async () => {
    const data = await storage.getItem('userData');
    if (data) {
      const parsedUser = JSON.parse(data);
      setUser(parsedUser);
      setFirstName(parsedUser.first_name);
      setLastName(parsedUser.last_name);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleUpdate = async () => {
    if (!firstName || !lastName) {
      Alert.alert("Erreur", "Le nom et le prénom sont obligatoires");
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/auth/update-profile`, 
        { first_name: firstName, last_name: lastName }
      );

      if (response.data.user) {
        await storage.setItem('userData', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsEditing(false);
        Alert.alert("Succès", "Profil mis à jour");
      }
    } catch (error: any) {
      Alert.alert("Erreur", error.response?.data?.error || "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Déconnexion", 
        onPress: async () => {
          await storage.clearAll();
          router.replace('/login');
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "SUPPRIMER LE COMPTE", 
      "Cette action est irréversible. Vos accès et données seront définitivement supprimés.",
      [
        { text: "ANNULER", style: "cancel" },
        { 
          text: "SUPPRIMER", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "CONFIRMATION FINALE",
              "Voulez-vous vraiment supprimer votre compte ?",
              [
                { text: "NON", style: "cancel" },
                { 
                  text: "OUI, SUPPRIMER TOUT", 
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setLoading(true);
                      await api.delete(`/auth/delete-account`);
                      await storage.clearAll();
                      router.replace('/login');
                    } catch (error) {
                      console.error("Erreur suppression compte:", error);
                      Alert.alert("Erreur", "Impossible de supprimer le compte");
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  return {
    user, isEditing, setIsEditing,
    firstName, setFirstName,
    lastName, setLastName,
    loading, handleUpdate, handleLogout, handleDeleteAccount,
    refreshUser: loadUser
  };
}
