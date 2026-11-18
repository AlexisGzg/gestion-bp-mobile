import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Home, Calendar, Plus, User, ShoppingBag } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: 'rgba(220, 184, 104, 0.45)',
        tabBarStyle: {
          backgroundColor: colors.primary[950],
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Montserrat_500Medium',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      {/* Tab 1: Inicio / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />

      {/* Tab 2: Agendar Cita */}
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Reservar',
          tabBarIcon: () => (
            <View style={styles.bookingChip}>
              <Plus size={18} color={colors.primary[950]} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Montserrat_600SemiBold',
            fontSize: 10,
            color: colors.primary[400],
            marginTop: 2,
          },
        }}
      />

      {/* Tab 3: Mis Citas / Pases QR */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <Calendar size={size - 2} color={color} />,
        }}
      />

      {/* Tab 4: Tienda / Boutique */}
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size - 2} color={color} />,
        }}
      />

      {/* Tab 5: Perfil & Lealtad */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bookingChip: {
    width: 44,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary[400],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[400],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
});
