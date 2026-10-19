import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppointmentItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { X, Calendar, Clock, User, RefreshCw } from 'lucide-react-native';
import { generateDynamicToken, getSlotCountdown, QR_SLOT_DURATION } from '../../lib/qr-crypto';

interface QRModalProps {
  visible: boolean;
  appointment: AppointmentItem | null;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ visible, appointment, onClose }) => {
  const [dynamicToken, setDynamicToken] = useState('');
  const [countdown, setCountdown] = useState(QR_SLOT_DURATION);

  // Token dinámico que rota cada 30s (mismo formato que valida el escáner web)
  useEffect(() => {
    if (!visible || !appointment) return;

    const qrSeed = appointment.qr_code || appointment.id;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDynamicToken(generateDynamicToken(appointment.id, qrSeed));
    setCountdown(getSlotCountdown());

    const interval = setInterval(() => {
      setDynamicToken(generateDynamicToken(appointment.id, qrSeed));
      setCountdown(getSlotCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, appointment]);

  if (!appointment) return null;

  const qrSeed = appointment.qr_code || appointment.id;
  const qrValue = dynamicToken || qrSeed;
  const manualCode = appointment.qr_code || appointment.id;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={22} color={colors.text.heading} />
          </TouchableOpacity>

          <Text style={styles.title}>Pase de Cita</Text>
          <Text style={styles.subtitle}>Presenta este código en recepción</Text>

          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={200}
              color={colors.primary[950]}
              backgroundColor={colors.white}
            />
          </View>

          {/* Countdown del slot de 30s */}
          <View style={styles.countdownRow}>
            <RefreshCw size={12} color={colors.text.muted} />
            <Text style={styles.countdownText}>
              Se renueva en {countdown}s
            </Text>
          </View>
          <View style={styles.countdownBarTrack}>
            <View
              style={[
                styles.countdownBarFill,
                { width: `${((QR_SLOT_DURATION - countdown) / QR_SLOT_DURATION) * 100}%` },
              ]}
            />
          </View>

          {/* Código estático para ingreso manual */}
          <Text style={styles.codeText}>{manualCode}</Text>

          <View style={styles.ticketDetails}>
            <Text style={styles.serviceName}>{appointment.service_name}</Text>

            <View style={styles.row}>
              <Calendar size={14} color={colors.primary[500]} />
              <Text style={styles.detailText}>{appointment.date}</Text>
              <Clock size={14} color={colors.primary[500]} style={{ marginLeft: 12 }} />
              <Text style={styles.detailText}>{appointment.start_time} hrs</Text>
            </View>

            <View style={styles.row}>
              <User size={14} color={colors.primary[500]} />
              <Text style={styles.detailText}>Barbero: {appointment.barber_name}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(55, 27, 17, 0.75)', // Sombra Brown Derby oscura
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
  },
  title: {
    ...typography.h2,
    color: colors.text.heading,
    marginTop: 8,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: 2,
    marginTop: 12,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  countdownText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  countdownBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardAlt,
    marginTop: 6,
    overflow: 'hidden',
  },
  countdownBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
  ticketDetails: {
    width: '100%',
    backgroundColor: colors.primary[50],
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.heading,
    marginBottom: 6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  detailText: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: 6,
  },
});