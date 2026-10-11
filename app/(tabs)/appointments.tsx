import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppointmentCard } from '../../src/components/molecules/AppointmentCard';
import { QRModal } from '../../src/components/organisms/QRModal';
import { AppointmentsService } from '../../src/services/appointments.service';
import { AuthService } from '../../src/services/auth.service';
import { AppointmentItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Calendar, LogOut } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedQRAppointment, setSelectedQRAppointment] = useState<AppointmentItem | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const user = await AuthService.getCurrentUser();
      const profile = await AuthService.getCurrentUserProfile();

      if (user) {
        setUserName(profile?.full_name || user.email?.split('@')[0] || 'Cliente');
        const data = await AppointmentsService.getMyAppointments(user.id);
        setAppointments(data);
      }
    } catch (err: any) {
      Alert.alert('Error', 'No se pudieron cargar tus citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancelAppointment = (appointment: AppointmentItem) => {
    Alert.alert(
      'Cancelar Cita',
      `¿Seguro que deseas cancelar tu cita del ${appointment.date} a las ${appointment.start_time}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AppointmentsService.cancelAppointment(appointment.id);
              Alert.alert('Cita cancelada', 'Tu cita ha sido cancelada.');
              loadAppointments();
            } catch (err: any) {
              Alert.alert('Error', 'No se pudo cancelar la cita');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await AuthService.logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera con Saludo y Salir */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.subtitle}>Tus citas y pases QR registrados</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Lista de Citas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.center}>
          <Calendar size={48} color={colors.primary[300]} />
          <Text style={styles.emptyTitle}>No tienes citas registradas</Text>
          <Text style={styles.emptySubtitle}>Presiona el botón "+" para agendar tu primera cita.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
    paddingBottom: 12,
  },
  greeting: {
    ...typography.h2,
    color: colors.text.heading,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.heading,
    marginTop: 14,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
});