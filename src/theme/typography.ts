import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  // Fuentes cargadas con @expo-google-fonts/montserrat
  family: {
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_500Medium',
    semiBold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
  },

  // Escala de tamaños y pesos (PDF Págs. 27-29)
  h1: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: colors.text.heading,
  } as TextStyle,

  h2: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: colors.text.heading,
  } as TextStyle,

  h3: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: colors.text.heading,
  } as TextStyle,

  body: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.text.primary,
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  } as TextStyle,

  button: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.text.secondary,
  } as TextStyle,
} as const;

export type Typography = typeof typography;