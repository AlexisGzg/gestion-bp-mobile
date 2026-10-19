import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ServiceCard } from '../../src/components/molecules/ServiceCard';
import { Button } from '../../src/components/atoms/Button';
import { Input } from '../../src/components/atoms/Input';
import { CatalogService } from '../../src/services/catalog.service';
import { AppointmentsService } from '../../src/services/appointments.service';
import { AuthService } from '../../src/services/auth.service';
import { ServiceItem, BarberItem, AppointmentItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Check, ArrowLeft, Calendar, User, Scissors, CalendarClock } from 'lucide-react-native';

const AVAILABLE_HOURS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

function getLocalDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Horas que aún se pueden agendar (si la fecha es hoy, filtra las que ya pasaron)
function getAvailableHours(date: string): string[] {
  if (date !== getLocalDateISO()) return AVAILABLE_HOURS;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return AVAILABLE_HOURS.filter((hour) => {
    const [h, m] = hour.split(':').map(Number);
    return h * 60 + m > nowMinutes;
  });
}

export default function BookingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados de la reserva
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberItem | null>(null);
  const [selectedDate] = useState(getLocalDateISO());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [notes, setNotes] = useState('');
  const [activeAppointment, setActiveAppointment] = useState<AppointmentItem | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [servs, barbs] = await Promise.all([
          CatalogService.getServices(),
          CatalogService.getBarbers(),
        ]);
        setServices(servs);
        setBarbers(barbs);
        if (barbs.length > 0) setSelectedBarber(barbs[0]);
      } catch (err: any) {
        Alert.alert('Error', 'No se pudieron cargar los datos de agendamiento');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Guard: re-valida la cita activa cada vez que la pestaña gana foco
  // (así se libera si el cliente canceló desde Mis Citas)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const user = await AuthService.getCurrentUser();
          const active = user ? await AppointmentsService.hasActiveAppointment(user.id) : null;
          if (!cancelled) setActiveAppointment(active);
        } catch {
          // sin conexión o error: no bloquea el flujo
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const handleConfirmAppointment = async () => {
    if (!selectedService || !selectedBarber) return;

    if (!getAvailableHours(selectedDate).includes(selectedTime)) {
      Alert.alert('Horario no disponible', 'La hora seleccionada ya pasó. Elige otra hora.');
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile();

      if (!user) {
        Alert.alert('Sesión requerida', 'Debes iniciar sesión para agendar');
        return;
      }

      // Validación: una sola cita activa
      const active = await AppointmentsService.hasActiveAppointment(user.id);
      if (active) {
        setActiveAppointment(active);
        Alert.alert(
          'Ya tienes una cita activa',
          `Tienes una cita el ${active.date} a las ${active.start_time}. Cancela o espera a que termine para agendar otra.`
        );
        return;
      }

      // Validación: solape de horario con citas del barbero
      const startMin = AppointmentsService.timeToMinutes(selectedTime);
      const endMin = startMin + selectedService.duration;
      const endH = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
      const endM = String(endMin % 60).padStart(2, '0');
      const endTime = `${endH}:${endM}`;

      const barberApts = await AppointmentsService.getBarberAppointmentsForDate(
        selectedBarber.id,
        selectedDate
      );
      const conflict = AppointmentsService.hasTimeConflict(selectedTime, endTime, barberApts);
      if (conflict) {
        Alert.alert(
          'Horario ocupado',
          `${selectedBarber.full_name} ya tiene una cita de ${conflict.start_time} a ${conflict.end_time}. Elige otra hora.`
        );
        setStep(2);
        return;
      }

      const created = await AppointmentsService.createAppointment({
        clientId: user.id,
        clientName: profile?.full_name || user.email?.split('@')[0] || 'Cliente',
        clientEmail: user.email || '',
        clientPhone: profile?.phone || '',
        barberId: selectedBarber.id,
        barberName: selectedBarber.full_name,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration,
        date: selectedDate,
        startTime: selectedTime,
        notes,
      });

      Alert.alert(
        '¡Cita Agendada!',
        'Tu cita ha sido registrada con éxito. Ya puedes ver tu pase QR en la pestaña Mis Citas.',
        [{ text: 'Ver Pase QR', onPress: () => router.push('/(tabs)/appointments') }]
      );
      // Con la cita creada, el guard muestra el bloqueo (no puede agendar otra)
      setStep(1);
      setSelectedService(null);
      setActiveAppointment(created);
    } catch (err: any) {
      Alert.alert('Error al agendar', err.message || 'Ocurrió un error al guardar tu cita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Guard: ya tiene una cita activa
  if (activeAppointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockedContainer}>
          <CalendarClock size={56} color={colors.primary[500]} />
          <Text style={styles.blockedTitle}>Ya tienes una cita activa</Text>
          <Text style={styles.blockedDesc}>
            Tu cita programada es el {activeAppointment.date} a las {activeAppointment.start_time} hrs
            {' '}con {activeAppointment.barber_name || 'tu barbero'}. Cancela desde Mis Citas si
            necesitas agendar otra.
          </Text>
          <Button
            title="Ver Mis Citas"
            onPress={() => router.push('/(tabs)/appointments')}
            style={{ marginTop: 20, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con pasos */}
      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep((step - 1) as any)} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text.heading} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Agendar Cita (Paso {step} de 3)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* PASO 1: SELECCIONAR SERVICIO */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>1. Elige tu Servicio</Text>
            <Text style={styles.sectionDesc}>Selecciona el corte o servicio que deseas reservar</Text>

            {services.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                selected={selectedService?.id === srv.id}
                onSelect={(selected) => setSelectedService(selected)}
              />
            ))}

            <Button
              title="Continuar"
              onPress={() => {
                const hours = getAvailableHours(selectedDate);
                if (!hours.includes(selectedTime)) {
                  setSelectedTime(hours[0] ?? '');
                }
                setStep(2);
              }}
              disabled={!selectedService}
              style={{ marginTop: 16 }}
            />
          </View>
        )}

        {/* PASO 2: BARBERO Y HORARIO */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>2. Barbero y Horario</Text>
            <Text style={styles.sectionDesc}>¿Con quién y a qué hora prefieres atenderte?</Text>

            {/* Selector de Barbero */}
            <Text style={styles.subTitle}>Selecciona Barbero</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barbersRow}>
              {barbers.map((barber) => {
                const isSelected = selectedBarber?.id === barber.id;
                return (
                  <TouchableOpacity
                    key={barber.id}
                    onPress={() => setSelectedBarber(barber)}
                    style={[styles.barberCard, isSelected && styles.barberCardSelected]}
                  >
                    <View style={[styles.avatarBox, isSelected && styles.avatarBoxSelected]}>
                      <User size={24} color={isSelected ? colors.white : colors.primary[500]} />
                    </View>
                    <Text style={styles.barberName}>{barber.full_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selector de Horario */}
            <Text style={[styles.subTitle, { marginTop: 20 }]}>Horarios Disponibles</Text>
            <View style={styles.hoursGrid}>
              {AVAILABLE_HOURS.map((hour) => {
                const isSelected = selectedTime === hour;
                const isPast = !getAvailableHours(selectedDate).includes(hour);
                return (
                  <TouchableOpacity
                    key={hour}
                    disabled={isPast}
                    onPress={() => setSelectedTime(hour)}
                    style={[
                      styles.hourChip,
                      isSelected && styles.hourChipSelected,
                      isPast && styles.hourChipDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.hourText,
                        isSelected && styles.hourTextSelected,
                        isPast && styles.hourTextDisabled,
                      ]}
                    >
                      {hour}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Revisar Cita"
              onPress={() => setStep(3)}
              disabled={!selectedBarber || !getAvailableHours(selectedDate).includes(selectedTime)}
              style={{ marginTop: 24 }}
            />
          </View>
        )}

        {/* PASO 3: RESUMEN Y NOTAS */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>3. Confirmar Cita</Text>
            <Text style={styles.sectionDesc}>Revisa los datos antes de agendar</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Scissors size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.summaryLabel}>Servicio:</Text>
                  <Text style={styles.summaryValue}>{selectedService?.name}</Text>
                  <Text style={styles.summaryPrice}>${selectedService?.price} MXN ({selectedService?.duration} min)</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <User size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.summaryLabel}>Barbero:</Text>
                  <Text style={styles.summaryValue}>{selectedBarber?.full_name}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Calendar size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.summaryLabel}>Fecha y Hora:</Text>
                  <Text style={styles.summaryValue}>{selectedDate} a las {selectedTime} hrs</Text>
                </View>
              </View>
            </View>

            <Input
              label="Notas para el barbero (opcional)"
              placeholder="Ej. Corte degradado bajo, barba cuadrada..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />

            <Button
              title="Confirmar y Generar Pase QR"
              onPress={handleConfirmAppointment}
              loading={submitting}
              icon={<Check size={20} color={colors.primary[50]} />}
              style={{ marginTop: 12 }}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.heading,
  },
  scroll: {
    padding: 20,
  },
  sectionTitle: {
    ...typography.h1,
    color: colors.text.heading,
  },
  sectionDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 16,
    marginTop: 2,
  },
  subTitle: {
    ...typography.h3,
    color: colors.text.heading,
    marginBottom: 10,
  },
  barbersRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  barberCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    width: 120,
  },
  barberCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarBoxSelected: {
    backgroundColor: colors.primary[500],
  },
  barberName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.heading,
    textAlign: 'center',
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hourChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  hourChipDisabled: {
    opacity: 0.35,
    backgroundColor: colors.cardAlt,
  },
  hourText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
  },
  hourTextSelected: {
    color: colors.primary[50],
  },
  hourTextDisabled: {
    color: colors.text.muted,
    textDecorationLine: 'line-through',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 10,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.heading,
  },
  summaryPrice: {
    ...typography.caption,
    color: colors.primary[500],
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  blockedTitle: {
    ...typography.h2,
    color: colors.text.heading,
    textAlign: 'center',
    marginTop: 16,
  },
  blockedDesc: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
});