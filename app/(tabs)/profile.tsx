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
import { LoyaltyProgress } from '../../src/components/molecules/LoyaltyProgress';
import { AuthService } from '../../src/services/auth.service';
import { LoyaltyService } from '../../src/services/loyalty.service';
import { supabase } from '../../src/lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { ClientLoyaltySummary } from '../../src/types';
import { LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [summary, setSummary] = useState<ClientLoyaltySummary | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const u = await AuthService.getCurrentUser();
      const p = await AuthService.getCurrentUserProfile();
      setUser(u);
      setProfile(p);
      setFirstName(p?.first_name || u?.user_metadata?.first_name || '');
      setLastName(p?.last_name || u?.user_metadata?.last_name || '');
      setAlias(p?.alias || '');
      setPhone(p?.phone || u?.user_metadata?.phone || '');

      // Buscar cliente relacionado (si existe)
      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .or(`profile_id.eq.${u?.id}`)
        .maybeSingle();
      setClient(c);

      if (c) {
        const s = await LoyaltyService.getClientLoyaltySummary({
          clientId: c.id,
          clientName: c.name || p?.full_name || u?.user_metadata?.full_name || 'Cliente',
          currentVisits: c.current_visits ?? 0,
          totalVisits: c.total_visits ?? 0,
          points: c.loyalty_points ?? 0,
        });
        setSummary(s);
      } else {
        setSummary(null);
      }
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
    if (!firstName.trim()) {
      Alert.alert('Campo requerido', 'El nombre no puede estar vacío');
      return;
    }
    try {
      setUpdating(true);
      await AuthService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        alias: alias.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone,
      });
      Alert.alert('Listo', 'Datos actualizados');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Contraseña corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coinciden', 'Las contraseñas no coinciden');
      return;
    }
    try {
      setChangingPass(true);
      await AuthService.changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Listo', 'Contraseña actualizada correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setChangingPass(false);
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

        <View style={[styles.card, styles.section]}>
          <Text style={styles.cardTitle}>Datos personales</Text>
          <Input
            label="Nombre *"
            placeholder="Tu nombre"
            value={firstName}
            onChangeText={setFirstName}
          />
          <Input
            label="Apellido"
            placeholder="Tu apellido"
            value={lastName}
            onChangeText={setLastName}
          />
          <Input
            label="Alias (opcional)"
            placeholder="Ej. Goku, BarberKing"
            value={alias}
            onChangeText={setAlias}
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

        <View style={[styles.card, styles.section]}>
          <Text style={styles.cardTitle}>Cambiar contraseña</Text>
          <Input
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            title="Actualizar contraseña"
            onPress={handleChangePassword}
            loading={changingPass}
            variant="outline"
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.section}>
          {summary ? (
            <LoyaltyProgress summary={summary} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fidelización</Text>
              <Text style={styles.loyalSub}>Aún no hay datos de fidelización</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, styles.section]}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <View style={styles.loyalMetaRow}>
            <Text style={styles.loyalMetaLabel}>Puntos</Text>
            <Text style={styles.loyalMetaValue}>
              {client?.loyalty_points ?? profile?.loyalty_points ?? 0}
            </Text>
          </View>
          <View style={styles.loyalMetaRow}>
            <Text style={styles.loyalMetaLabel}>Visitas totales</Text>
            <Text style={styles.loyalMetaValue}>{client?.total_visits ?? 0}</Text>
          </View>
          <View style={[styles.loyalMetaRow, styles.loyalMetaRowLast]}>
            <Text style={styles.loyalMetaLabel}>Última visita</Text>
            <Text style={styles.loyalMetaValue}>
              {client?.last_visit_at ? client.last_visit_at.slice(0, 10) : '—'}
            </Text>
          </View>
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
  section: { marginBottom: 16 },
  loyalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  loyalMetaRowLast: { borderBottomWidth: 0 },
  loyalMetaLabel: { ...typography.bodySmall, color: colors.text.secondary },
  loyalMetaValue: { ...typography.bodySmall, fontWeight: '600', color: colors.text.heading },
  loyalSub: { ...typography.caption, color: colors.text.muted, marginTop: 4 },
});
