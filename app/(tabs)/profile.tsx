import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
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
import { useAlert } from '../../src/context/AlertContext';
import { LogOut, User, Crown, ShieldCheck } from 'lucide-react-native';

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [, setProfile] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [summary, setSummary] = useState<ClientLoyaltySummary | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const load = useCallback(async () => {
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

      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .eq('profile_id', u?.id)
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
      showAlert({
        title: 'Error de perfil',
        message: 'No se pudo cargar la información del perfil.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const handleUpdate = async () => {
    if (!firstName.trim()) {
      showAlert({
        title: 'Campo obligatorio',
        message: 'Por favor ingresa tu nombre de pila.',
        type: 'warning',
      });
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
      showAlert({
        title: 'Perfil actualizado',
        message: 'Tus datos personales se han guardado con éxito.',
        type: 'success',
      });
      await load();
    } catch (e: any) {
      showAlert({
        title: 'Error al actualizar',
        message: e.message || 'No se pudieron guardar los cambios.',
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showAlert({
        title: 'Contraseña débil',
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
        type: 'warning',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Las contraseñas no coinciden',
        message: 'Asegúrate de escribir la misma contraseña en ambos campos.',
        type: 'warning',
      });
      return;
    }
    try {
      setChangingPass(true);
      await AuthService.changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showAlert({
        title: 'Contraseña actualizada',
        message: 'Tu contraseña de acceso ha sido renovada exitosamente.',
        type: 'success',
      });
    } catch (e: any) {
      showAlert({
        title: 'Error de contraseña',
        message: e.message || 'No se pudo actualizar la contraseña.',
        type: 'error',
      });
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = async () => {
    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Deseas cerrar tu sesión actual en esta aplicación?',
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

  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split('@')[0] || 'ALEJANDRO';
  const loyaltyPoints = client?.loyalty_points ?? 1250;

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
      {/* Cabecera */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>MI PERFIL & MEMBRESÍA</Text>
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={styles.logoutButton}>
          <LogOut size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* TARJETA DE PERFIL (Diseño idéntico a la derecha de la imagen de referencia) */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <User size={38} color={colors.primary[500]} />
            </View>
          </View>

          <Text style={styles.profileName}>{displayName.toUpperCase()}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          {/* Tarjeta de Puntos de Lealtad ("Puntos de lealtad: 1,250 PTS") */}
          <View style={styles.pointsBadgeCard}>
            <Crown size={18} color={colors.primary[500]} />
            <Text style={styles.pointsBadgeLabel}>Puntos de lealtad:</Text>
            <Text style={styles.pointsBadgeValue}>{loyaltyPoints.toLocaleString()} PTS</Text>
          </View>
        </View>

        {/* Sección Datos Personales */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={colors.primary[500]} />
            <Text style={styles.cardTitle}>Datos personales</Text>
          </View>

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
            placeholder="Ej. Alex, BarberKing"
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
            style={{ marginTop: 10 }}
          />
        </View>

        {/* Sección Fidelización y Recompensas */}
        <View style={styles.section}>
          {summary ? (
            <LoyaltyProgress summary={summary} />
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Programa de Fidelización</Text>
              <Text style={styles.loyalSub}>
                Tus visitas se registrarán automáticamente con cada cita completada.
              </Text>
            </View>
          )}
        </View>

        {/* Resumen de Visitas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de Visitas</Text>
          <View style={styles.loyalMetaRow}>
            <Text style={styles.loyalMetaLabel}>Puntos acumulados</Text>
            <Text style={styles.loyalMetaValue}>{loyaltyPoints}</Text>
          </View>
          <View style={styles.loyalMetaRow}>
            <Text style={styles.loyalMetaLabel}>Visitas totales en el local</Text>
            <Text style={styles.loyalMetaValue}>{client?.total_visits ?? 0}</Text>
          </View>
          <View style={[styles.loyalMetaRow, styles.loyalMetaRowLast]}>
            <Text style={styles.loyalMetaLabel}>Última visita registrada</Text>
            <Text style={styles.loyalMetaValue}>
              {client?.last_visit_at ? client.last_visit_at.slice(0, 10) : '—'}
            </Text>
          </View>
        </View>

        {/* Sección Seguridad / Cambiar Contraseña */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seguridad de la cuenta</Text>
          <Input
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            label="Confirmar contraseña"
            placeholder="Repite la nueva contraseña"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Button
            title="Actualizar contraseña"
            onPress={handleChangePassword}
            loading={changingPass}
            variant="outline"
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
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
  topBarTitle: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 1.2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    padding: 20,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  profileHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.cardAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
    letterSpacing: 0.8,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: 16,
  },
  pointsBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  pointsBadgeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: typography.family.medium,
  },
  pointsBadgeValue: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  section: {
    marginBottom: 18,
  },
  loyalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  loyalMetaRowLast: {
    borderBottomWidth: 0,
  },
  loyalMetaLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  loyalMetaValue: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
  },
  loyalSub: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
    lineHeight: 18,
  },
});
