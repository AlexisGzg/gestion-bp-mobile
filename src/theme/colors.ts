export const colors = {
  // Paleta Oficial Brown Derby (Gestión Barber Pro)
  primary: {
    50: '#FCF8F0',  // Fondo claro principal
    100: '#F8EDDC',
    200: '#EFD9B9', // Bordes y divisores
    300: '#E5BD8C', // Iconos decorativos
    400: '#DA9B5D',
    500: '#D1813E', // Acento de acción / Botón flotante / Badges
    600: '#C36B33',
    700: '#A2532C',
    800: '#82442A', // Texto principal (Prohibido negro puro #000000)
    900: '#693925',
    950: '#371B11', // Encabezados principales
  },

  // Fondos y Superficies
  background: '#FCF8F0',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F8EDDC',
  border: '#EFD9B9',

  // Textos semánticos
  text: {
    primary: '#82442A',   // 800
    heading: '#371B11',   // 950
    secondary: '#A2532C', // 700
    muted: '#C36B33',     // 600
    inverse: '#FCF8F0',   // Para botones con fondo oscuro
    accent: '#D1813E',    // 500
  },

  // Estados semánticos (Citas y Alertas)
  status: {
    pending: '#DA9B5D',    // Pendiente (Ámbar)
    confirmed: '#2E7D32',  // Confirmada (Verde)
    completed: '#1565C0',  // Completada (Azul)
    cancelled: '#C62828',  // Cancelada (Rojo)
  },

  // Elementos UI
  white: '#FFFFFF',
  divider: '#EFD9B9',
  shadow: '#371B11',
} as const;

export type Colors = typeof colors;