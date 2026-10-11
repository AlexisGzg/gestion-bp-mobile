import { TextStyle } from 'react-native';

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
    color: '#371B11',
  } as TextStyle,

  h2: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: '#371B11',
  } as TextStyle,

  h3: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#371B11',
  } as TextStyle,

  body: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: '#82442A',
  } as TextStyle,

  bodySmall: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#82442A',
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
    color: '#A2532C',
  } as TextStyle,
} as const;

export type Typography = typeof typography;