import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { AppointmentCard } from '../../src/components/molecules/AppointmentCard';
import { QRModal } from '../../src/components/organisms/QRModal';
import { AppointmentsService } from '../../src/services/appointments.service';
import { AuthService } from '../../src/services/auth.service';
import { supabase } from '../../src/lib/supabase';
import { AppointmentItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useAlert } from '../../src/context/AlertContext';
import { Calendar, LogOut, Scissors } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { showAlert } = useAlert();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedQRAppointment, setSelectedQRAppointment] = useState<AppointmentItem | null>(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile(user?.id);

      if (user) {
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Cliente');
        const data = await AppointmentsService.getMyAppointments(user.id);
        setAppointments(data);
      }
    } catch {
      showAlert({
        title: 'Error de conexión',
        message: 'No se pudieron sincronizar tus citas con el servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAppointments();
  }, [loadAppointments]);

  const selectedQRRef = useRef<AppointmentItem | null>(null);
  useEffect(() => {
    selectedQRRef.current = selectedQRAppointment;
  }, [selectedQRAppointment]);

  useEffect(() => {
    const channel = supabase
      .channel('client-dashboard-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          const updated = payload.new as Partial<AppointmentItem> | null;
          if (!updated) return;

          if (
            updated.id &&
            updated.id === selectedQRRef.current?.id &&
            updated.status === 'in_progress'
          ) {
            setSelectedQRAppointment(null);
            showAlert({
              title: '¡Tu cita ha comenzado!',
              message: 'Tu pase QR fue validado con éxito. Pasa a la silla de tu barbero.',
              type: 'success',
            });
          }

          AuthService.getCurrentUser().then((user) => {
            if (user && updated.client_id === user.id) loadAppointments();
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showAlert, loadAppointments]);

  const handleCancelAppointment = (appointment: AppointmentItem) => {
    showAlert({
      title: 'Cancelar Cita',
      message: `¿Seguro que deseas cancelar tu cita del ${appointment.date} a las ${appointment.start_time} hrs?`,
      type: 'confirm',
      buttons: [
        { text: 'Mantener cita', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AppointmentsService.cancelAppointment(appointment.id);
              showAlert({
                title: 'Cita cancelada',
                message: 'Tu cita ha sido cancelada correctamente.',
                type: 'info',
              });
              loadAppointments();
            } catch {
              showAlert({
                title: 'Error al cancelar',
                message: 'No se pudo cancelar la cita. Inténtalo de nuevo.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir de tu cuenta?',
      type: 'confirm',
      buttons: [
        { text: 'Permanecer', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
          },
        },
      ],
    });
  };

  const upcoming = appointments.filter((a) =>
    ['pending', 'confirmed', 'in_progress'].includes(a.status)
  );
  const past = appointments.filter(
    (a) => !['pending', 'confirmed', 'in_progress'].includes(a.status)
  );
  const sections = [
    { title: 'CITAS ACTIVAS Y PRÓXIMAS', data: upcoming },
    { title: 'HISTORIAL DE VISITAS', data: past },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera con Saludo y Salir */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Scissors size={20} color={colors.primary[500]} />
          <View>
            <Text style={styles.greeting}>Mis Citas & Pases</Text>
            <Text style={styles.subtitle}>Hola, {userName}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={styles.logoutButton}>
          <LogOut size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Lista de Citas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <Calendar size={44} color={colors.primary[500]} />
          </View>
          <Text style={styles.emptyTitle}>No tienes citas registradas</Text>
          <Text style={styles.emptySubtitle}>
            Presiona {'"'}Reservar{'"'} en el menú inferior para agendar tu primera experiencia.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onViewQR={(app) => setSelectedQRAppointment(app)}
              onCancel={handleCancelAppointment}
            />
          )}
          onRefresh={loadAppointments}
          refreshing={loading}
        />
      )}

      {/* Modal Nativo del Código QR */}
      <QRModal
        visible={!!selectedQRAppointment}
        appointment={selectedQRAppointment}
        onClose={() => setSelectedQRAppointment(null)}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  logoutButton: {
    padding: 9,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.text.muted,
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
});
