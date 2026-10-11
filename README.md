# GBP Mobile — Gestión Barber Pro

![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo)
![React%20Native](https://img.shields.io/badge/React%20Native-0.86-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)

**GBP Mobile** es la aplicación móvil de Gestión Barber Pro para clientes. Permite consultar productos, reservar citas con un barbero y servicio, revisar las citas propias y mostrar el código QR asociado a una reserva. La autenticación y los datos se conectan al proyecto de Supabase configurado para la aplicación.

---

## Funcionalidades

- **Acceso de clientes** con correo y contraseña, registro y autenticación OAuth con Google mediante Supabase.
- **Tienda** con catálogo de productos activos, categorías y disponibilidad de inventario.
- **Agendamiento de citas** en tres pasos: servicio, barbero y horario, y confirmación.
- **Mis citas** con estado, cancelación y visualización del pase QR.
- **Sesión persistente** mediante AsyncStorage y Supabase Auth.

> La tienda móvil muestra productos; el flujo de compra y pago no está implementado en esta aplicación.

---

## Stack Tecnológico

- **Aplicación**: React Native 0.86 + Expo SDK 57.
- **Lenguaje**: TypeScript.
- **Navegación**: Expo Router.
- **Autenticación y datos**: Supabase JS, Supabase Auth y AsyncStorage.
- **UI**: componentes React Native propios, fuentes Montserrat e iconos Lucide.
- **Builds móviles**: EAS Build con perfiles `development`, `preview` y `production`.

---

## Estructura del Proyecto

```text
app/
├── (auth)/                 # Inicio de sesión y registro
├── (tabs)/                 # Tienda, agendamiento y mis citas
└── _layout.tsx             # Carga de fuentes y protección de rutas
src/
├── components/
│   ├── atoms/               # Botón, input y badge
│   ├── molecules/           # Tarjetas de producto, servicio y cita
│   └── organisms/           # Modal QR
├── lib/                     # Cliente Supabase
├── services/                # Auth, catálogo y citas
├── theme/                   # Colores y tipografía
└── types/                   # Modelos TypeScript
assets/                      # Iconos e imágenes
app.json                     # Configuración Expo y esquema de deep link
eas.json                     # Perfiles de compilación EAS
```

---

## Inicio Rápido

### Requisitos

- Node.js y npm.
- Una cuenta de Supabase con el esquema y políticas requeridos por la app.
- Para compilar builds con EAS, una cuenta de Expo.

### 1. Instalar

```bash
git clone <repo-url>
cd gestion-bp-mobile
npm ci
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
```

Usa la Project URL y la clave `publishable` (o la clave pública `anon` heredada) del proyecto Supabase de la aplicación web si ambas deben compartir datos. No pongas claves `secret` o `service_role` en una app móvil. Los archivos `.env*` están excluidos de Git y deben configurarse por separado en cada computadora.

### 3. Iniciar desarrollo

```bash
npx expo start
```

Este comando permite desarrollar con Expo Go para funciones compatibles. **Para probar OAuth de Google en el teléfono, usa un development build**; Expo Go no permite configurar el esquema nativo propio de la app de forma adecuada.

### 4. Crear y ejecutar un development build

Instala el cliente de desarrollo:

```bash
npx expo install expo-dev-client
```

Configura EAS e inicia la compilación Android:

```bash
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform android
```

Instala el build en el dispositivo desde el enlace proporcionado por EAS. Después, desde la carpeta del proyecto:

```bash
npx expo start --dev-client
```

El dispositivo debe poder conectarse al servidor de desarrollo. Si la red local no funciona, prueba `npx expo start --dev-client --tunnel`.

EAS Build se ejecuta en la nube. Las variables locales de `.env` no se transfieren automáticamente: configura `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` en **Project → Environment variables** de Expo para el entorno correspondiente al perfil.

---

## Configuración de Google OAuth

1. En Supabase, habilita Google en **Authentication → Sign In / Providers** y configura las credenciales de Google.
2. En Google Cloud, el redirect URI autorizado del cliente web del proveedor debe ser el callback de Supabase:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. En Supabase, agrega a **Authentication → URL Configuration → Redirect URLs** la URI nativa usada por la app:
   `gestion-bp-mobile://auth/callback`.
4. La app usa el esquema `gestion-bp-mobile`, declarado en `app.json`. Si cambia el esquema nativo, vuelve a generar e instalar el development build.

El `Site URL` puede seguir siendo el sitio web de producción; el retorno móvil se configura por separado en la lista de Redirect URLs.

---

## Validaciones

```bash
npx tsc --noEmit
npx expo lint
```

---

Desarrollado para **GBP — Gestión Barber Pro**.
