import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { AccountScreen } from '../screens/AccountScreen';
import { CouponsScreen } from '../screens/CouponsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';

export type MainTabParamList = {
  Podsumowanie: undefined;
  Kupony: undefined;
  Konto: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/** Dolna nawigacja — cztery główne sekcje aplikacji. */
export function AppTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tab.Screen
        name="Podsumowanie"
        component={DashboardScreen}
        options={{
          title: 'Podsumowanie',
          tabBarLabel: 'Podsumowanie',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Kupony"
        component={CouponsScreen}
        options={{
          title: 'Moje kupony',
          tabBarLabel: 'Kupony',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ticket-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Konto"
        component={AccountScreen}
        options={{
          title: 'Moje konto',
          tabBarLabel: 'Konto',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
