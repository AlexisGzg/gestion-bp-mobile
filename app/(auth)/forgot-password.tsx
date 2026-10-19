import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { AuthService } from '../../src/services/auth.service';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { ArrowLeft, MailCheck } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Campo incompleto', 'Ingresa tu correo electrónico');
      return;
    }

    try {
      setLoading(true);
      await AuthService.resetPassword(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.logoBox}>
          <MailCheck size={44} color={colors.primary[500]} />
          <Text style={styles.brandTitle}>Recuperar contraseña</Text>
          <Text style={styles.brandSubtitle}>
            Te enviaremos un enlace a tu correo para restablecerla.
          </Text>
        </View>

        <View style={styles.card}>
          {sent ? (
            <>
              <Text style={styles.formTitle}>Correo enviado</Text>
              <Text style={styles.sentText}>
                Revisa tu bandeja de entrada (y la carpeta de spam) para continuar con el
                restablecimiento de tu contraseña.
              </Text>
              <Button
                title="Volver a iniciar sesión"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.submitButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Recuperar acceso</Text>
              <Input
                label="Correo Electrónico"
                placeholder="ejemplo@correo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Button
                title="Enviar enlace"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />
              <TouchableOpacity onPress={() => router.back()} style={styles.footerRow}>
                <Text style={styles.linkText}>Volver a iniciar sesión</Text>
              </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
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
  brandSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 12,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  sentText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  footerRow: {
    alignSelf: 'center',
    marginTop: 20,
  },
  submitButton: {
    marginTop: 8,
  },
  linkText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[500],
  },
});
