import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppointmentItem } from '../../types';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { QrCode, Calendar, Clock, User, Scissors } from 'lucide-react-native';

interface AppointmentCardProps {
  appointment: AppointmentItem;
  onViewQR: (appointment: AppointmentItem) => void;
  onCancel?: (appointment: AppointmentItem) => void;
}

export const AppointmentCard = React.memo<AppointmentCardProps>(({ appointment, onViewQR, onCancel }) => {
  const { colors, isDark } = useTheme();
  const isActive = appointment.status === 'pending' || appointment.status === 'confirmed';

  return (
    <View style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
      {/* MUESCAS LATERALES DE CORTE / TICKET PERFORATION */}
      <View style={[styles.notchLeft, { backgroundColor: colors.background, borderColor: colors.border }]} />
      <View style={[styles.notchRight, { backgroundColor: colors.background, borderColor: colors.border }]} />

      {/* CABECERA DEL TICKET */}
      <View style={styles.ticketHeader}>
        <View style={styles.ticketHeaderLeft}>
          <View style={styles.tagRow}>
            <Scissors size={11} color={colors.primary[500]} />
            <Text style={[styles.tagText, { color: isDark ? colors.primary[400] : colors.primary[600] }]}>
              PASE OFICIAL DE SERVICIO
            </Text>
          </View>
          <Text style={[styles.serviceName, { color: colors.text.heading }]}>
            {appointment.service_name || 'Servicio Barbería'}
          </Text>
          <Text style={[styles.price, { color: colors.primary[500] }]}>${appointment.service_price || 0} MXN</Text>
        </View>
        <Badge status={appointment.status} />
      </View>

      {/* LÍNEA DE TROQUELADO / PERFORACIÓN */}
      <View style={styles.perforationRow}>
        <View style={[styles.dashedLine, { borderColor: colors.divider }]} />
      </View>

      {/* CUERPO DEL TICKET: FECHA, HORA Y BARBERO */}
      <View style={styles.ticketBody}>
        <View style={styles.scheduleGrid}>
          <View style={[styles.scheduleItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.white }]}>
              <Calendar size={14} color={colors.primary[500]} />
            </View>
            <View>
              <Text style={[styles.scheduleMetaLabel, { color: colors.text.muted }]}>FECHA</Text>
              <Text style={[styles.scheduleMetaValue, { color: colors.text.heading }]}>{appointment.date}</Text>
            </View>
          </View>

          <View style={[styles.scheduleItem, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? colors.surface : colors.white }]}>
              <Clock size={14} color={colors.primary[500]} />
            </View>
            <View>
              <Text style={[styles.scheduleMetaLabel, { color: colors.text.muted }]}>HORARIO</Text>
              <Text style={[styles.scheduleMetaValue, { color: colors.text.heading }]}>{appointment.start_time} hrs</Text>
            </View>
          </View>
        </View>

        <View style={styles.barberRow}>
          <View style={[styles.barberAvatar, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <User size={15} color={colors.primary[500]} />
          </View>
          <View style={styles.barberInfo}>
            <Text style={[styles.barberSub, { color: colors.text.muted }]}>BARBERO ASIGNADO</Text>
            <Text style={[styles.barberName, { color: colors.text.heading }]}>
              {appointment.barber_name || 'Asignado en sucursal'}
            </Text>
          </View>
        </View>
      </View>

      {/* ACCIONES DEL TICKET */}
      {isActive && (
        <View style={styles.actions}>
          <Button
            title="Ver Pase QR"
            onPress={() => onViewQR(appointment)}
            variant="primary"
            style={styles.qrButton}
            icon={<QrCode size={18} color={isDark ? colors.primary[950] : colors.primary[50]} />}
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
});
AppointmentCard.displayName = 'AppointmentCard';

const styles = StyleSheet.create({
  ticketCard: {
    position: 'relative',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 10,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  notchLeft: {
    position: 'absolute',
    left: -13,
    top: 98,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    zIndex: 2,
  },
  notchRight: {
    position: 'absolute',
    right: -13,
    top: 98,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    zIndex: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  ticketHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1.5,
  },
  serviceName: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    letterSpacing: 0.3,
  },
  price: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    marginTop: 2,
  },
  perforationRow: {
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'center',
  },
  dashedLine: {
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  ticketBody: {
    marginTop: 10,
    marginBottom: 4,
  },
  scheduleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  scheduleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleMetaLabel: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1,
  },
  scheduleMetaValue: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    marginTop: 1,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  barberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  barberInfo: {
    flex: 1,
  },
  barberSub: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1,
  },
  barberName: {
    fontSize: 13,
    fontFamily: typography.family.semiBold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  qrButton: {
    flex: 1,
    height: 44,
  },
  cancelButton: {
    height: 44,
    paddingHorizontal: 12,
  },
});
