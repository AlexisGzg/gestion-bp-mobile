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
import { useTheme } from '../../src/context/ThemeContext';
import { Calendar, LogOut } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [selectedQRAppointment, setSelectedQRAppointment] = useState<AppointmentItem | null>(null);

  const loadAppointments = useCallback(async (background = false) => {
    try {
      if (background) setRefreshing(true);
      else setLoading(true);
      const user = await AuthService.getCurrentUser();

      if (!user) {
        setUserId(null);
        setUserName('');
        setAppointments([]);
        return;
      }

      setUserId(user.id);
      const [profile, data] = await Promise.all([
        AuthService.getCurrentUserProfile(user.id),
        AppointmentsService.getMyAppointments(user.id),
      ]);
      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Cliente');
      setAppointments(data);
    } catch {
      showAlert({
        title: 'Error de conexión',
        message: 'No se pudieron sincronizar tus citas con el servidor.',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAlert]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments();
  }, [loadAppointments]);

  const selectedQRRef = useRef<AppointmentItem | null>(null);
  useEffect(() => {
    selectedQRRef.current = selectedQRAppointment;
  }, [selectedQRAppointment]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`client-dashboard-appointments-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${userId}`,
        },
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

          void loadAppointments(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [showAlert, loadAppointments, userId]);

  const handleCancelAppointment = useCallback((appointment: AppointmentItem) => {
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
              void loadAppointments(true);
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
  }, [loadAppointments, showAlert]);

  const handleLogout = useCallback(() => {
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
  }, [showAlert]);

  const handleViewQR = useCallback((appointment: AppointmentItem) => {
    setSelectedQRAppointment(appointment);
  }, []);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabecera Refinada */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleBox}>
          <View style={[styles.headerIconBadge, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <Calendar size={18} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={[styles.headerSuper, { color: colors.primary[500] }]}>
              {userName ? `CLIENTE: ${userName.toUpperCase()}` : 'GESTIÓN BARBER PRO'}
            </Text>
            <Text style={[styles.greeting, { color: colors.text.heading }]}>Mis Citas & Pases</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={[styles.logoutButton, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
        >
          <LogOut size={16} color={colors.status.cancelled} />
        </TouchableOpacity>
      </View>

      {/* Lista de Citas */}
      {loading ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : appointments.length === 0 ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <Calendar size={44} color={colors.primary[500]} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.heading }]}>No tienes citas registradas</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
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
              onViewQR={handleViewQR}
              onCancel={handleCancelAppointment}
            />
          )}
          onRefresh={() => void loadAppointments(true)}
          refreshing={refreshing}
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
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSuper: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1.5,
  },
  greeting: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    letterSpacing: 0.3,
  },
  logoutButton: {
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
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
