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

      try {
        const token = await storage.getItem("userToken");
        const seg0 = segments[0] as string | undefined;
        const inAuthGroup = seg0 === "login";
        const isRegistering = seg0 === "register";

        if (!token) {
          if (!inAuthGroup && !isRegistering) {
            router.replace("/login");
          }
        } else {
          // Utilisation d'un cast 'any' pour éviter les erreurs TS sur les chemins
          const isAtRoot = (segments as any).length === 0 || seg0 === "" || seg0 === "index" || seg0 === undefined;
          if (inAuthGroup || isAtRoot) {
            const selectedId = await storage.getItem('selectedControllerId');
            if (selectedId) {
              router.replace("/(tabs)");
            } else {
              router.replace("/controllers" as any);
            }
          }
        }
      } catch (err) {
        console.error("Erreur checkRedirect:", err);
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
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="controllers" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
