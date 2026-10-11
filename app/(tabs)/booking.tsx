import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ServiceCard } from '../../src/components/molecules/ServiceCard';
import { Button } from '../../src/components/atoms/Button';
import { Input } from '../../src/components/atoms/Input';
import { CatalogService } from '../../src/services/catalog.service';
import { AppointmentsService } from '../../src/services/appointments.service';
import { AuthService } from '../../src/services/auth.service';
import { ServiceItem, BarberItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Check, ArrowLeft, Calendar, User, Scissors } from 'lucide-react-native';

const AVAILABLE_HOURS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [notes, setNotes] = useState('');

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

  const handleConfirmAppointment = async () => {
    if (!selectedService || !selectedBarber) return;

    try {
      setSubmitting(true);
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile();

      if (!user) {
        Alert.alert('Sesión requerida', 'Debes iniciar sesión para agendar');
        return;
      }

      await AppointmentsService.createAppointment({
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
      // Reset
      setStep(1);
      setSelectedService(null);
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
              onPress={() => setStep(2)}
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
                return (
                  <TouchableOpacity
                    key={hour}
                    onPress={() => setSelectedTime(hour)}
                    style={[styles.hourChip, isSelected && styles.hourChipSelected]}
                  >
                    <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>{hour}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Revisar Cita"
              onPress={() => setStep(3)}
              disabled={!selectedBarber || !selectedTime}
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
  hourText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
  },
  hourTextSelected: {
    color: colors.primary[50],
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
});