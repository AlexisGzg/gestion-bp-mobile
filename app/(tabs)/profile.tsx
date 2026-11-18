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
import { typography } from '../../src/theme/typography';
import { ClientLoyaltySummary } from '../../src/types';
import { useAlert } from '../../src/context/AlertContext';
import { useTheme } from '../../src/context/ThemeContext';
import { LogOut, User, Crown, ShieldCheck, Sun, Moon, Smartphone, Palette, Sparkles } from 'lucide-react-native';

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

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
      const p = await AuthService.getCurrentUserProfile(u?.id);
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
    if (!newPassword || newPassword.length < 6) {
      showAlert({
        title: 'Contraseña muy corta',
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
        type: 'warning',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Contraseñas no coinciden',
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* CABECERA SUPERIOR REFINADA */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.topBarIconBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <User size={18} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={[styles.topBarTag, { color: colors.primary[500] }]}>GESTIÓN BARBER PRO</Text>
            <Text style={[styles.topBarTitle, { color: colors.text.heading }]}>Mi Perfil & Membresía</Text>
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* TARJETA DE PERFIL HERITAGE */}
        <View
          style={[
            styles.profileHeaderCard,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <View style={[styles.avatarRing, { borderColor: colors.primary[500] }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.cardAlt }]}>
              <User size={38} color={colors.primary[500]} />
            </View>
          </View>

          <Text style={[styles.profileName, { color: colors.text.heading }]}>{displayName.toUpperCase()}</Text>
          <Text style={[styles.profileEmail, { color: colors.text.secondary }]}>{user?.email}</Text>

          {/* Tarjeta de Puntos de Lealtad */}
          <View style={[styles.pointsBadgeCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <Crown size={16} color={colors.primary[500]} />
            <Text style={[styles.pointsBadgeLabel, { color: colors.text.secondary }]}>Puntos de lealtad:</Text>
            <Text style={[styles.pointsBadgeValue, { color: colors.primary[500] }]}>
              {loyaltyPoints.toLocaleString()} PTS
            </Text>
          </View>
        </View>

        {/* SECCIÓN NUEVA: APARIENCIA Y TEMA (MODO OSCURO / CLARO / SISTEMA) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: colors.cardAlt }]}>
              <Palette size={16} color={colors.primary[500]} />
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={[styles.cardTitle, { color: colors.text.heading }]}>Apariencia y Tema</Text>
              <Text style={[styles.cardSubTitle, { color: colors.text.muted }]}>
                Personaliza los tonos visuales de tu barbería
              </Text>
            </View>
          </View>

          {/* SELECTOR DE TEMAS INTERACTIVO */}
          <View style={styles.themeSelectorRow}>
            {/* OPCIÓN CLARO */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setThemeMode('light')}
              style={[
                styles.themeCard,
                { backgroundColor: colors.cardAlt, borderColor: colors.border },
                themeMode === 'light' && [
                  styles.themeCardActive,
                  { borderColor: colors.primary[500], backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                ],
              ]}
            >
              <View style={[styles.themePillIcon, { backgroundColor: '#F3EACE' }]}>
                <Sun size={18} color="#C18831" />
              </View>
              <Text
                style={[
                  styles.themeTitle,
                  { color: colors.text.heading },
                  themeMode === 'light' && { color: colors.primary[500], fontFamily: typography.family.bold },
                ]}
              >
                Claro
              </Text>
              <Text style={[styles.themeDesc, { color: colors.text.muted }]}>Luz clásica</Text>
            </TouchableOpacity>

            {/* OPCIÓN OSCURO */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setThemeMode('dark')}
              style={[
                styles.themeCard,
                { backgroundColor: colors.cardAlt, borderColor: colors.border },
                themeMode === 'dark' && [
                  styles.themeCardActive,
                  { borderColor: colors.primary[500], backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                ],
              ]}
            >
              <View style={[styles.themePillIcon, { backgroundColor: '#25130C' }]}>
                <Moon size={18} color="#D19C3E" />
              </View>
              <Text
                style={[
                  styles.themeTitle,
                  { color: colors.text.heading },
                  themeMode === 'dark' && { color: colors.primary[500], fontFamily: typography.family.bold },
                ]}
              >
                Oscuro
              </Text>
              <Text style={[styles.themeDesc, { color: colors.text.muted }]}>Espresso élite</Text>
            </TouchableOpacity>

            {/* OPCIÓN SISTEMA */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setThemeMode('system')}
              style={[
                styles.themeCard,
                { backgroundColor: colors.cardAlt, borderColor: colors.border },
                themeMode === 'system' && [
                  styles.themeCardActive,
                  { borderColor: colors.primary[500], backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                ],
              ]}
            >
              <View style={[styles.themePillIcon, { backgroundColor: isDark ? '#341D13' : '#F3EACE' }]}>
                <Smartphone size={18} color={colors.primary[500]} />
              </View>
              <Text
                style={[
                  styles.themeTitle,
                  { color: colors.text.heading },
                  themeMode === 'system' && { color: colors.primary[500], fontFamily: typography.family.bold },
                ]}
              >
                Sistema
              </Text>
              <Text style={[styles.themeDesc, { color: colors.text.muted }]}>Automático</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.themeNoticeBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <Sparkles size={14} color={colors.primary[500]} />
            <Text style={[styles.themeNoticeText, { color: colors.text.secondary }]}>
              {isDark
                ? 'Tema oscuro activo: paleta Espresso de alto contraste.'
                : 'Tema claro activo: paleta Marfil y Crema Brown Derby.'}
            </Text>
          </View>
        </View>

        {/* Sección Datos Personales */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: colors.cardAlt }]}>
              <ShieldCheck size={16} color={colors.primary[500]} />
            </View>
            <View style={styles.cardHeaderTexts}>
              <Text style={[styles.cardTitle, { color: colors.text.heading }]}>Datos personales</Text>
              <Text style={[styles.cardSubTitle, { color: colors.text.muted }]}>Información de contacto en sucursal</Text>
            </View>
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
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text.heading }]}>Programa de Fidelización</Text>
              <Text style={[styles.loyalSub, { color: colors.text.muted }]}>
                Tus visitas se registrarán automáticamente con cada cita completada.
              </Text>
            </View>
          )}
        </View>

        {/* Resumen de Visitas */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.heading, marginBottom: 12 }]}>Resumen de Visitas</Text>
          <View style={[styles.loyalMetaRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.loyalMetaLabel, { color: colors.text.secondary }]}>Puntos acumulados</Text>
            <Text style={[styles.loyalMetaValue, { color: colors.primary[500] }]}>{loyaltyPoints}</Text>
          </View>
          <View style={[styles.loyalMetaRow, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.loyalMetaLabel, { color: colors.text.secondary }]}>Visitas totales en el local</Text>
            <Text style={[styles.loyalMetaValue, { color: colors.primary[500] }]}>{client?.total_visits ?? 0}</Text>
          </View>
          <View style={[styles.loyalMetaRow, styles.loyalMetaRowLast]}>
            <Text style={[styles.loyalMetaLabel, { color: colors.text.secondary }]}>Última visita registrada</Text>
            <Text style={[styles.loyalMetaValue, { color: colors.primary[500] }]}>
              {client?.last_visit_at ? client.last_visit_at.slice(0, 10) : '—'}
            </Text>
          </View>
        </View>

        {/* Sección Seguridad / Cambiar Contraseña */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text.heading, marginBottom: 12 }]}>Seguridad de la cuenta</Text>
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTag: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1.5,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    letterSpacing: 0.3,
  },
  logoutButton: {
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 110,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeaderCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 20,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    letterSpacing: 0.8,
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  pointsBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  pointsBadgeLabel: {
    fontSize: 12,
    fontFamily: typography.family.medium,
  },
  pointsBadgeValue: {
    fontSize: 14,
    fontFamily: typography.family.bold,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.family.bold,
  },
  cardSubTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    marginBottom: 18,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  themeCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  themeCardActive: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  themePillIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  themeTitle: {
    fontSize: 12,
    fontFamily: typography.family.semiBold,
  },
  themeDesc: {
    fontSize: 9,
    marginTop: 2,
  },
  themeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  themeNoticeText: {
    fontSize: 11,
    fontFamily: typography.family.medium,
    flex: 1,
  },
  loyalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  loyalMetaRowLast: {
    borderBottomWidth: 0,
  },
  loyalMetaLabel: {
    fontSize: 13,
  },
  loyalMetaValue: {
    fontSize: 13,
    fontFamily: typography.family.bold,
  },
  loyalSub: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
});
