export const colors = {
  // Paleta Oficial Brown Derby (Gestión Barber Pro)
  // Sincronizada con la web: src/app/globals.css → --color-brown-derby-*
  primary: {
    50: '#FAF7EC',  // Fondo claro principal
    100: '#F3EACE',
    200: '#E9D59F', // Bordes y divisores
    300: '#DCB868', // Iconos decorativos
    400: '#D19C3E',
    500: '#C18831', // Acento de acción / Botón flotante / Badges
    600: '#A66A28',
    700: '#854E23',
    800: '#6F4024', // Texto principal (Prohibido negro puro #000000)
    900: '#4F2D1D',
    950: '#371B11', // Encabezados principales
  },

  // Fondos y Superficies
  background: '#FAF7EC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F3EACE',
  border: '#E9D59F',

  // Textos semánticos
  text: {
    primary: '#6F4024',   // 800
    heading: '#371B11',   // 950
    secondary: '#854E23', // 700
    muted: '#A66A28',     // 600
    inverse: '#FAF7EC',   // Para botones con fondo oscuro
    accent: '#C18831',    // 500
  },

  // Estados semánticos (Citas y Alertas) — sincronizados con la web (status.ts)
  status: {
    pending: '#B45309',     // Pendiente (Ámbar 700)
    confirmed: '#1D4ED8',   // Confirmada (Azul 700)
    in_progress: '#7E22CE', // En proceso (Morado 700) — al escanear el QR
    completed: '#047857',   // Completada (Esmeralda 700)
    cancelled: '#B91C1C',   // Cancelada (Rojo 700)
    no_show: '#4B5563',     // No asistió (Gris 600)
  },

  // Fondos de estado (Badges) — web: bg-*-100
  statusBg: {
    pending: '#FEF3C7',     // Ámbar 100
    confirmed: '#DBEAFE',   // Azul 100
    in_progress: '#F3E8FF', // Morado 100
    completed: '#D1FAE5',   // Esmeralda 100
    cancelled: '#FEE2E2',   // Rojo 100
    no_show: '#F3F4F6',     // Gris 100
  },

  // Elementos UI
  white: '#FFFFFF',
  divider: '#E9D59F',
  shadow: '#371B11',
} as const;

export type Colors = typeof colors;
