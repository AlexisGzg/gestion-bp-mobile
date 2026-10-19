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
        return { label: 'Confirmada', bg: colors.statusBg.confirmed, text: colors.status.confirmed };
      case 'in_progress':
        return { label: 'En proceso', bg: colors.statusBg.in_progress, text: colors.status.in_progress };
      case 'completed':
        return { label: 'Completada', bg: colors.statusBg.completed, text: colors.status.completed };
      case 'cancelled':
        return { label: 'Cancelada', bg: colors.statusBg.cancelled, text: colors.status.cancelled };
      case 'no_show':
        return { label: 'No asistió', bg: colors.statusBg.no_show, text: colors.status.no_show };
      case 'pending':
      default:
        return { label: 'Pendiente', bg: colors.statusBg.pending, text: colors.status.pending };
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