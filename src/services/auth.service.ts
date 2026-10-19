import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

WebBrowser.maybeCompleteAuthSession();

export const AuthService = {
  // Iniciar sesión con email y contraseña
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  },

  // Registro de nuevo cliente con rol 'client'
  async register(name: string, email: string, password: string, phone?: string) {
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: name.trim(),
          phone: phone?.trim() || null,
          role: 'client',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Iniciar sesión con Google OAuth
  async loginWithGoogle() {
    const redirectUrl = makeRedirectUri({
      scheme: 'gestion-bp-mobile',
      path: 'auth/callback',
    });
    console.log('REDIRECT URL GENERADA:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No se pudo iniciar la autenticación con Google.');
    console.log('REDIRECT_TO ENVIADO A SUPABASE:', new URL(data.url).searchParams.get('redirect_to'));

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log('RESULTADO GOOGLE OAUTH:', {
      type: result.type,
      callback:
        result.type === 'success'
          ? `${new URL(result.url).origin}${new URL(result.url).pathname}`
          : null,
    });
    if (result.type !== 'success' || !result.url) return null;

    const callbackUrl = new URL(result.url);
    const fragmentParams = new URLSearchParams(callbackUrl.hash.slice(1));
    const getParam = (name: string) =>
      callbackUrl.searchParams.get(name) ?? fragmentParams.get(name);
    const authError = getParam('error_description') ?? getParam('error');
    if (authError) throw new Error(authError);

    const code = getParam('code');
    if (code) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Google no devolvió una sesión válida.');
      return sessionData.session;
    }

    const accessToken = getParam('access_token');
    const refreshToken = getParam('refresh_token');
    if (accessToken && refreshToken) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('Google no devolvió una sesión válida.');
      return sessionData.session;
    }

    throw new Error('No se recibió la respuesta de autenticación de Google.');
  },
  // Cerrar sesión
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario autenticado actual desde la sesión
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  // Obtener perfil completo del cliente desde la tabla 'profiles'
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  },

  // Actualizar datos del perfil
  async updateProfile(updates: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    alias?: string;
    phone?: string;
    avatar_url?: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Enviar correo para restablecer la contraseña
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  },

  // Cambiar la contraseña del usuario autenticado
  async changePassword(password: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
};