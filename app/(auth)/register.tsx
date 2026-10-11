import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/atoms/Input';
import { Button } from '../../src/components/atoms/Button';
import { AuthService } from '../../src/services/auth.service';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos obligatorios', 'Por favor llena todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await AuthService.register(name, email, password, phone);
      Alert.alert('¡Cuenta creada!', 'Tu cuenta ha sido registrada con éxito. Ya puedes iniciar sesión.');
      router.replace('/(auth)/login');
    } catch (err: any) {
      Alert.alert('Error al registrarse', err.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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
        <View style={styles.card}>
          <Text style={styles.title}>Crea tu Cuenta</Text>
          <Text style={styles.subtitle}>Gestiona tus citas y acumula visitas</Text>

          <Input
            label="Nombre Completo"
            placeholder="Alexis González"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Correo Electrónico"
            placeholder="cliente@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Teléfono / WhatsApp"
            placeholder="55 1234 5678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />

          {/* Separador */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Registrarse con Google */}
          <Button
            title="Registrarse con Google"
            onPress={handleGoogleRegister}
            variant="outline"
            loading={googleLoading}
            style={styles.googleButton}
          />

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.text.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 10,
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
  backButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  backText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[500],
  },
});