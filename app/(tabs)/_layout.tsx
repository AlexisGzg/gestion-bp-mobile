import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';
import { ShoppingBag, Calendar, Plus, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.primary[400],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Montserrat_500Medium',
          fontSize: 11,
        },
      }}
    >
      {/* Tab 1: Tienda */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />

      {/* Tab 2: Agendar Cita (acción principal destacada) */}
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Agendar',
          tabBarIcon: () => (
            <View style={styles.bookingChip}>
              <Plus size={18} color={colors.primary[50]} />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Montserrat_600SemiBold',
            fontSize: 11,
            color: colors.primary[500],
          },
        }}
      />

      {/* Tab 3: Mis Citas / Pase QR */}
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Mis Citas',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />

      {/* Tab 4: Perfil + Lealtad */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bookingChip: {
    width: 46,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
