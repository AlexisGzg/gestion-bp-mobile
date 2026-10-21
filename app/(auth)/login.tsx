import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { AuthService } from '../../src/services/auth.service';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Scissors } from 'lucide-react-native';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido');
      return;
    }

    try {
      setLoading(true);
      await AuthService.login(email, password);
    } catch (err: any) {
      Alert.alert('Error de inicio de sesión', 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const session = await AuthService.loginWithGoogle();
      if (!session) return;
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error con Google', err.message || 'No se pudo iniciar sesión con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <Scissors size={48} color={colors.primary[500]} />
          <Text style={styles.brandTitle}>Gestión Barber Pro</Text>
          <Text style={styles.brandSubtitle}>Acceso Clientes</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Button
            title="Ingresar"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitButton}
          />

          {/* Separador */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón de Google */}
          <Button
            title="Continuar con Google"
            onPress={handleGoogleLogin}
            variant="outline"
            loading={googleLoading}
            style={styles.googleButton}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 28,
  },
  brandTitle: {
    ...typography.h1,
    color: colors.text.heading,
    marginTop: 12,
  },
  brandSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
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
  formTitle: {
    ...typography.h2,
    color: colors.text.heading,
    marginBottom: 20,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 8,
  },
  forgotText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary[500],
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.caption,
    marginHorizontal: 12,
    color: colors.text.muted,
  },
  googleButton: {
    borderColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  linkText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[500],
  },
});