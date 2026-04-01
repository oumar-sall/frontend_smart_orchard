import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { storage } from '../utils/storage';
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      await storage.getItem("userToken");
      // On ne stocke plus dans le state local car on re-récupère dans l'effet de redirection
    } catch (e) {
      console.error("Erreur lors de la récupération du token", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkRedirect = async () => {
      if (isLoading) return;

      const currentToken = await storage.getItem("userToken");
      const inAuthGroup = segments[0] === "login";
      const isRegistering = segments[0] === "register";

      if (!currentToken && !inAuthGroup && !isRegistering) {
        router.replace("/login");
      } else if (currentToken && (inAuthGroup || (segments.length as number) === 0 || (segments[0] as string) === "index")) {
        // Redirection intelligente sauf si on est déjà en train de s'enregistrer
        const selectedId = await storage.getItem('selectedControllerId');
        if (selectedId) {
          router.replace("/(tabs)");
        } else {
          router.replace("/controllers" as any);
        }
      }
    };
    checkRedirect();
  }, [segments, isLoading, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="register" options={{ gestureEnabled: false }} />
      <Stack.Screen name="cgu" options={{ presentation: 'modal', headerShown: true, title: "Conditions Générales" }} />
      <Stack.Screen name="profil" options={{ presentation: 'card', headerShown: true, title: "Mon Profil" }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="controllers" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
