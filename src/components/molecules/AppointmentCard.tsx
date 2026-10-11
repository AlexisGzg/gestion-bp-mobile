import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentItem } from '../../types';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { QrCode, Calendar, Clock, User } from 'lucide-react-native';

interface AppointmentCardProps {
  appointment: AppointmentItem;
  onViewQR: (appointment: AppointmentItem) => void;
  onCancel?: (appointment: AppointmentItem) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onViewQR, onCancel }) => {
  const isActive = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.serviceName}>{appointment.service_name || 'Servicio Barbería'}</Text>
          <Text style={styles.price}>${appointment.service_price || 0} MXN</Text>
        </View>
        <Badge status={appointment.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={16} color={colors.primary[500]} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color={colors.primary[500]} />
          <Text style={styles.detailText}>{appointment.start_time} hrs</Text>
        </View>
      </View>

      <View style={styles.detailItem}>
        <User size={16} color={colors.primary[500]} />
        <Text style={styles.detailText}>Barbero: {appointment.barber_name || 'Asignado en sucursal'}</Text>
      </View>

      {isActive && (
        <View style={styles.actions}>
          <Button
            title="Ver Pase QR"
            onPress={() => onViewQR(appointment)}
            variant="primary"
            style={styles.qrButton}
            icon={<QrCode size={18} color={colors.primary[50]} />}
          />
          {onCancel && (
            <Button
              title="Cancelar"
              onPress={() => onCancel(appointment)}
              variant="ghost"
              style={styles.cancelButton}
              textStyle={{ color: colors.status.cancelled }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceName: {
    ...typography.h3,
    color: colors.text.heading,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  qrButton: {
    flex: 1,
    height: 42,
  },
  cancelButton: {
    height: 42,
    paddingHorizontal: 12,
  },
});