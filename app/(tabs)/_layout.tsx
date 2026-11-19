import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { Home, Calendar, Plus, User, ShoppingBag } from 'lucide-react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        tabBarActiveTintColor: isDark ? colors.primary[400] : colors.primary[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 22 : 14,
          left: 16,
          right: 16,
          height: 64,
          backgroundColor: colors.surface,
          borderRadius: 28,
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.45 : 0.12,
          shadowRadius: 14,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Montserrat_600SemiBold',
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Tienda',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size - 2} color={color} />,
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: 'Agendar',
          tabBarIcon: () => (
            <View
              style={[
                styles.bookingChip,
                {
                  backgroundColor: colors.primary[500],
                  borderColor: isDark ? colors.primary[300] : colors.primary[200],
                  shadowColor: colors.primary[500],
                },
              ]}
            >
              <Plus
                size={20}
                color={isDark ? colors.primary[950] : colors.primary[50]}
                strokeWidth={2.8}
              />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Montserrat_700Bold',
            fontSize: 10,
            color: isDark ? colors.primary[400] : colors.primary[500],
            marginTop: 2,
          },
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Mis citas',
          tabBarIcon: ({ color, size }) => <Calendar size={size - 2} color={color} />,
        }}
      />

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
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
});
