import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
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
import { useAlert } from '../../src/context/AlertContext';
import {
  Check,
  ArrowLeft,
  Calendar,
  User,
  Scissors,
  CalendarClock,
  Sparkles,
  Star,
  CheckCircle2,
} from 'lucide-react-native';

const AVAILABLE_HOURS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
];

function getLocalDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  const { showAlert } = useAlert();

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
      } catch {
        showAlert({
          title: 'Error de conexión',
          message: 'No se pudieron cargar los servicios y barberos disponibles.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const user = await AuthService.getCurrentUser();
          const active = user ? await AppointmentsService.hasActiveAppointment(user.id) : null;
          if (!cancelled) setActiveAppointment(active);
        } catch {
          // sin conexión
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
      showAlert({
        title: 'Horario no disponible',
        message: 'La hora seleccionada ya pasó. Por favor elige otro horario.',
        type: 'warning',
      });
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile();

      if (!user) {
        showAlert({
          title: 'Inicio de sesión requerido',
          message: 'Debes iniciar sesión con tu cuenta para agendar una cita.',
          type: 'warning',
        });
        return;
      }

      const active = await AppointmentsService.hasActiveAppointment(user.id);
      if (active) {
        setActiveAppointment(active);
        showAlert({
          title: 'Cita en curso existente',
          message: `Ya cuentas con una cita el ${active.date} a las ${active.start_time} hrs. Cancela o espera a que concluya para agendar una nueva.`,
          type: 'warning',
        });
        return;
      }

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
        showAlert({
          title: 'Horario no disponible',
          message: `${selectedBarber.full_name} ya tiene reservado de ${conflict.start_time} a ${conflict.end_time} hrs. Por favor selecciona otro horario.`,
          type: 'warning',
        });
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

      showAlert({
        title: '¡Cita Confirmada con Éxito!',
        message: 'Tu cita ha sido reservada en la agenda del barbero. Tu pase con código QR ya está listo.',
        type: 'success',
        buttons: [
          {
            text: 'Ver Pase QR',
            style: 'default',
            onPress: () => router.push('/(tabs)/appointments'),
          },
        ],
      });

      setStep(1);
      setSelectedService(null);
      setActiveAppointment(created);
    } catch (err: any) {
      showAlert({
        title: 'Error al reservar',
        message: err.message || 'Ocurrió un problema al guardar tu reserva.',
        type: 'error',
      });
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

  if (activeAppointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockedContainer}>
          <View style={styles.blockedIconBox}>
            <CalendarClock size={52} color={colors.primary[500]} />
          </View>
          <Text style={styles.blockedTitle}>Ya tienes una cita activa</Text>
          <Text style={styles.blockedDesc}>
            Tu cita programada es el {activeAppointment.date} a las {activeAppointment.start_time} hrs
            con {activeAppointment.barber_name || 'tu barbero'}. Cancela desde Historial si necesitas agendar otra.
          </Text>
          <Button
            title="Ver Pase QR en Mis Citas"
            onPress={() => router.push('/(tabs)/appointments')}
            style={{ marginTop: 20, alignSelf: 'stretch' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera con Indicador de Pasos */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep((step - 1) as any)} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.text.heading} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <Text style={styles.headerTitle}>RESERVAR CITA</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Indicador de 3 Pasos Visual */}
      <View style={styles.stepsBar}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Servicios</Text>
        </View>

        <View style={[styles.stepConnector, step >= 2 && styles.stepConnectorActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Barbero</Text>
        </View>

        <View style={[styles.stepConnector, step >= 3 && styles.stepConnectorActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Fecha/Hora</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* PASO 1: SELECCIONAR SERVICIO */}
        {step === 1 && (
          <View>
            {/* TARJETA ACCESO AL ASESOR FACIAL IA */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.aiAdvisorBanner}
              onPress={() => router.push('/face-scan')}
            >
              <View style={styles.aiAdvisorLeft}>
                <View style={styles.aiAdvisorIcon}>
                  <Sparkles size={18} color={colors.primary[50]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.aiAdvisorTitle}>¿Indeciso con qué corte elegir?</Text>
                  <Text style={styles.aiAdvisorSub}>
                    Prueba nuestro Asesor Facial con IA y descubre tu corte ideal.
                  </Text>
                </View>
              </View>
              <View style={styles.aiAdvisorBtn}>
                <Text style={styles.aiAdvisorBtnText}>Probar</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>1. Elige tu Servicio</Text>
            <Text style={styles.sectionDesc}>Selecciona el tratamiento que deseas reservar hoy</Text>

            {services.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={srv}
                selected={selectedService?.id === srv.id}
                onSelect={(selected) => setSelectedService(selected)}
              />
            ))}

            <Button
              title="Continuar con Barbero"
              onPress={() => {
                const hours = getAvailableHours(selectedDate);
                if (!hours.includes(selectedTime)) {
                  setSelectedTime(hours[0] ?? '');
                }
                setStep(2);
              }}
              disabled={!selectedService}
              style={{ marginTop: 20 }}
            />
          </View>
        )}

        {/* PASO 2: BARBERO Y HORARIO */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>2. Selecciona tu Barbero</Text>
            <Text style={styles.sectionDesc}>Profesionales expertos en estilo y cuidado masculino</Text>

            <View style={styles.barbersList}>
              {barbers.map((barber, index) => {
                const isSelected = selectedBarber?.id === barber.id;
                const rating = (4.9 - index * 0.1).toFixed(1);

                return (
                  <TouchableOpacity
                    key={barber.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedBarber(barber)}
                    style={[styles.barberRowCard, isSelected && styles.barberRowCardSelected]}
                  >
                    <View style={[styles.barberAvatarCircle, isSelected && styles.barberAvatarCircleSelected]}>
                      <User size={22} color={isSelected ? colors.primary[50] : colors.primary[500]} />
                    </View>

                    <View style={styles.barberInfoCol}>
                      <Text style={[styles.barberRowName, isSelected && styles.barberRowNameSelected]}>
                        {barber.full_name}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingText}>{rating}</Text>
                        <Star size={13} color={colors.primary[500]} fill={colors.primary[500]} />
                        <Text style={styles.specialtyText}>• Master Barber</Text>
                      </View>
                    </View>

                    {isSelected ? (
                      <CheckCircle2 size={22} color={colors.primary[500]} />
                    ) : (
                      <View style={styles.uncheckCircle} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>FECHA / HORA DISPONIBLE</Text>
            <Text style={styles.sectionDesc}>Citas para hoy ({selectedDate})</Text>

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
              title="Revisar y Confirmar"
              onPress={() => setStep(3)}
              disabled={!selectedBarber || !getAvailableHours(selectedDate).includes(selectedTime)}
              style={{ marginTop: 28 }}
            />
          </View>
        )}

        {/* PASO 3: RESUMEN Y NOTAS */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>3. Confirmación de Cita</Text>
            <Text style={styles.sectionDesc}>Verifica los detalles de tu reservación</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Scissors size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={styles.summaryLabel}>Servicio Seleccionado</Text>
                  <Text style={styles.summaryValue}>{selectedService?.name}</Text>
                  <Text style={styles.summaryPrice}>
                    ${selectedService?.price} MXN • {selectedService?.duration} minutos
                  </Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <User size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.summaryLabel}>Barbero Asignado</Text>
                  <Text style={styles.summaryValue}>{selectedBarber?.full_name}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Calendar size={20} color={colors.primary[500]} />
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.summaryLabel}>Fecha y Hora</Text>
                  <Text style={styles.summaryValue}>
                    {selectedDate} a las {selectedTime} hrs
                  </Text>
                </View>
              </View>
            </View>

            <Input
              label="Notas para tu barbero (opcional)"
              placeholder="Ej. Taper fade bajo, corte de cejas, arreglo de barba..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Confirmar y Generar Pase QR"
              onPress={handleConfirmAppointment}
              loading={submitting}
              icon={<Check size={20} color={colors.primary[50]} />}
              style={{ marginTop: 16 }}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 1.2,
  },
  stepsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    alignItems: 'center',
    width: 68,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.text.secondary,
  },
  stepNumberActive: {
    color: colors.primary[50],
  },
  stepLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontFamily: typography.family.medium,
  },
  stepLabelActive: {
    color: colors.primary[500],
    fontFamily: typography.family.bold,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.divider,
    marginBottom: 16,
  },
  stepConnectorActive: {
    backgroundColor: colors.primary[500],
  },
  scroll: {
    padding: 20,
    paddingBottom: 36,
  },
  aiAdvisorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 20,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  aiAdvisorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  aiAdvisorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAdvisorTitle: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  aiAdvisorSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  aiAdvisorBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  aiAdvisorBtnText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 16,
    marginTop: 3,
  },
  barbersList: {
    gap: 10,
    marginBottom: 12,
  },
  barberRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  barberRowCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.cardAlt,
  },
  barberAvatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barberAvatarCircleSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  barberInfoCol: {
    flex: 1,
  },
  barberRowName: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  barberRowNameSelected: {
    color: colors.text.heading,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
  },
  specialtyText: {
    fontSize: 11,
    color: colors.text.muted,
  },
  uncheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hourChip: {
    width: '31%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.2,
    borderColor: colors.border,
    alignItems: 'center',
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
    fontSize: 13,
    fontFamily: typography.family.bold,
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
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontFamily: typography.family.semiBold,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    marginTop: 2,
  },
  summaryPrice: {
    fontSize: 12,
    color: colors.primary[500],
    fontFamily: typography.family.semiBold,
    marginTop: 2,
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
  blockedIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  blockedTitle: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    textAlign: 'center',
  },
  blockedDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
});
