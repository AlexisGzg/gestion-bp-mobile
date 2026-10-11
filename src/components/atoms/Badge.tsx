import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentStatus } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface BadgeProps {
  status: AppointmentStatus;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmada', bg: '#E8F5E9', text: colors.status.confirmed };
      case 'completed':
        return { label: 'Completada', bg: '#E3F2FD', text: colors.status.completed };
      case 'cancelled':
      case 'no_show':
        return { label: 'Cancelada', bg: '#FFEBEE', text: colors.status.cancelled };
      case 'pending':
      default:
        return { label: 'Pendiente', bg: '#FFF8E1', text: colors.status.pending };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});