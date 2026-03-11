import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Couleurs de la maquette
const COLORS = {
  background: "#F5F0EB",
  tabBar: "#FFFFFF",
  activeGreen: "#4A7C59",
  inactive: "#9E9E9E",
  activeTabBg: "#EAF2EC",
  border: "#E8E0D8",
};

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconsName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.activeGreen,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: "Historique",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="capteurs"
        options={{
          title: "Capteurs",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="radio-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperActive: {
    backgroundColor: "#EAF2EC",
  },
});
