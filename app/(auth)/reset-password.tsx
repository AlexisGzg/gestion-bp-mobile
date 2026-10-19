import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { AuthService } from '../../src/services/auth.service';
import { supabase } from '../../src/lib/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { KeyRound } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useLinkingURL();

  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const consumeLink = useCallback(async (incoming: string) => {
    try {
      const parsed = new URL(incoming);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      const get = (name: string) => parsed.searchParams.get(name) ?? hash.get(name);

      const linkError = get('error_description') ?? get('error');
      if (linkError) {
        setError(decodeURIComponent(linkError.replace(/\+/g, ' ')));
        setStatus('error');
        return;
      }

      const code = get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        setStatus('ready');
        return;
      }

      const accessToken = get('access_token');
      const refreshToken = get('refresh_token');
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) throw sessionError;
        setStatus('ready');
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus('ready');
        return;
      }

      setError('El enlace no es válido o ya expiró. Solicita uno nuevo.');
      setStatus('error');
    } catch (e: any) {
      setError(e.message || 'No se pudo validar el enlace.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setError('Abre esta pantalla desde el enlace enviado a tu correo.');
      setStatus('error');
      return;
    }
    consumeLink(url);
  }, [url, consumeLink]);

  const handleSubmit = async () => {
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      Alert.alert('No coinciden', 'Las contraseñas no coinciden');
      return;
    }
    try {
      setSaving(true);
      await AuthService.changePassword(password);
      setPassword('');
      setConfirm('');
      Alert.alert('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.', [
        { text: 'Continuar', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <KeyRound size={44} color={colors.primary[500]} />
          <Text style={styles.brandTitle}>Nueva contraseña</Text>
        </View>

        <View style={styles.card}>
          {status === 'checking' ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.infoText}>Validando enlace…</Text>
            </View>
          ) : status === 'error' ? (
            <>
              <Text style={styles.formTitle}>Enlace inválido</Text>
              <Text style={styles.infoText}>{error}</Text>
              <Button
                title="Solicitar nuevo enlace"
                onPress={() => router.replace('/(auth)/forgot-password')}
                style={styles.submitButton}
              />
              <Button
                title="Volver a iniciar sesión"
                variant="ghost"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.ghostButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Crea tu nueva contraseña</Text>
              <Input
                label="Nueva contraseña"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Input
                label="Confirmar contraseña"
                placeholder="Repite la contraseña"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
              <Button
                title="Guardar contraseña"
                onPress={handleSubmit}
                loading={saving}
                style={styles.submitButton}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.text.heading,
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text.heading,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  ghostButton: {
    marginTop: 4,
  },
});
