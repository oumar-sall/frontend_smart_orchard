import { Stack } from "expo-router";

export default function ControllersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Mes Boîtiers" }} />
      <Stack.Screen name="[id]" options={{ title: "Gérer l'appareil" }} />
    </Stack>
  );
}
