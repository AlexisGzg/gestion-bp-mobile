import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { AuthService } from '../../src/services/auth.service';
import { supabase } from '../../src/lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Gift, RefreshCw, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [client, setClient] = useState<any>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const u = await AuthService.getCurrentUser();
      const p = await AuthService.getCurrentUserProfile();
      setUser(u);
      setProfile(p);
      setFullName(p?.full_name || u?.user_metadata?.full_name || '');
      setPhone(p?.phone || u?.user_metadata?.phone || '');

      // Buscar cliente relacionado (si existe)
      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .or(`profile_id.eq.${u?.id}`)
        .maybeSingle();
      setClient(c);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [])
  );

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await AuthService.updateProfile({ full_name: fullName, phone });
      Alert.alert('Listo', 'Datos actualizados');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir de la cuenta?', [
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Mi Perfil</Text>
            <Text style={styles.subtitle}>Gestiona tus datos y fidelización</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={22} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos personales</Text>
          <Input
            label="Nombre completo"
            placeholder="Tu nombre"
            value={fullName}
            onChangeText={setFullName}
          />
          <Input
            label="Teléfono / WhatsApp"
            placeholder="55 0000 0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={user?.email || ''}
            editable={false}
          />
          <Button
            title="Guardar cambios"
            onPress={handleUpdate}
            loading={updating}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Fidelización</Text>
            <RefreshCw size={16} color={colors.primary[400]} />
          </View>
          <View style={styles.loyalRow}>
            <View style={styles.loyalItem}>
              <Gift size={20} color={colors.primary[500]} />
              <Text style={styles.loyalValue}>{client?.loyalty_points ?? profile?.loyalty_points ?? 0}</Text>
              <Text style={styles.loyalLabel}>Puntos</Text>
            </View>
            <View style={styles.loyalItem}>
              <Text style={styles.loyalValue}>{client?.current_visits ?? 0}</Text>
              <Text style={styles.loyalLabel}>Visitas actuales</Text>
            </View>
            <View style={styles.loyalItem}>
              <Text style={styles.loyalValue}>{client?.total_visits ?? 0}</Text>
              <Text style={styles.loyalLabel}>Visitas totales</Text>
            </View>
          </View>
          <Text style={styles.loyalSub}>
            {client?.last_visit_at
              ? `Última visita: ${client.last_visit_at.slice(0, 10)}`
              : 'Sin visitas registradas aún'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardTitle: { ...typography.h3, color: colors.text.heading, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  loyalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  loyalItem: { flex: 1, alignItems: 'center', backgroundColor: colors.primary[50], padding: 12, borderRadius: 12 },
  loyalValue: { ...typography.h2, color: colors.primary[500], marginTop: 6 },
  loyalLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  loyalSub: { ...typography.caption, color: colors.text.muted, marginTop: 10, textAlign: 'center' },
});
