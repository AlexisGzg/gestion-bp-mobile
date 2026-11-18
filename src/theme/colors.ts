export const lightColors = {
  // Paleta Oficial Brown Derby (Gestión Barber Pro) - Tema Claro
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

  // Estados semánticos (Citas y Alertas) — sincronizados con la web
  status: {
    pending: '#B45309',     // Pendiente (Ámbar 700)
    confirmed: '#1D4ED8',   // Confirmada (Azul 700)
    in_progress: '#7E22CE', // En proceso (Morado 700)
    completed: '#047857',   // Completada (Esmeralda 700)
    cancelled: '#B91C1C',   // Cancelada (Rojo 700)
    no_show: '#4B5563',     // No asistió (Gris 600)
  },

  // Fondos de estado (Badges)
  statusBg: {
    pending: '#FEF3C7',
    confirmed: '#DBEAFE',
    in_progress: '#F3E8FF',
    completed: '#D1FAE5',
    cancelled: '#FEE2E2',
    no_show: '#F3F4F6',
  },

  // Elementos UI
  white: '#FFFFFF',
  divider: '#E9D59F',
  shadow: '#371B11',
  navBg: '#FFFFFF',
  navBorder: '#E9D59F',
} as const;

export const darkColors = {
  // Paleta Oficial Brown Derby - Tema Oscuro Élite (Espresso Tostado)
  // Prohibido negro neutro plano (#000000)
  primary: {
    50: '#FAF7EC',
    100: '#F3EACE',
    200: '#E9D59F',
    300: '#DCB868',
    400: '#D19C3E',
    500: '#C18831',
    600: '#A66A28',
    700: '#854E23',
    800: '#6F4024',
    900: '#4F2D1D',
    950: '#371B11',
  },

  // Fondos y Superficies oscuras cálidas
  background: '#150A06',
  surface: '#20100A',
  card: '#25130C',
  cardAlt: '#321A10',
  border: '#462316',

  // Textos semánticos para fondo oscuro
  text: {
    primary: '#F3EACE',
    heading: '#FAF7EC',
    secondary: '#E9D59F',
    muted: '#C4985A',
    inverse: '#150A06',
    accent: '#D19C3E',
  },

  // Estados semánticos en modo oscuro
  status: {
    pending: '#F59E0B',
    confirmed: '#60A5FA',
    in_progress: '#C084FC',
    completed: '#34D399',
    cancelled: '#F87171',
    no_show: '#9CA3AF',
  },

  statusBg: {
    pending: 'rgba(245, 158, 11, 0.2)',
    confirmed: 'rgba(96, 165, 250, 0.2)',
    in_progress: 'rgba(192, 132, 252, 0.2)',
    completed: 'rgba(52, 211, 153, 0.2)',
    cancelled: 'rgba(248, 113, 113, 0.2)',
    no_show: 'rgba(156, 163, 175, 0.2)',
  },

  white: '#FFFFFF',
  divider: '#3E1F13',
  shadow: '#000000',
  navBg: '#20100A',
  navBorder: '#462316',
} as const;

export const colors = lightColors;
export type Colors = typeof lightColors;
