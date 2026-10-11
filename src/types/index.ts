// Roles del sistema
export type UserRole = 'master' | 'admin' | 'barber' | 'receptionist' | 'client';

// Perfil de Usuario (Auth / Supabase)
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role: UserRole;
  created_at?: string;
}

// Datos de Cliente y Fidelización
export interface ClientProfile {
  id: string;
  profile_id?: string | null;
  type: 'registered' | 'guest';
  name: string;
  email?: string | null;
  phone?: string | null;
  loyalty_points: number;
  current_visits: number;
  total_visits: number;
}

// Catálogo de Servicios (Corte, Barba, etc.)
export interface ServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number; // duración en minutos
  is_active: boolean;
}

// Barberos / Empleados disponibles para agendar
export interface BarberItem {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  specialties?: string[] | null;
  status: 'active' | 'inactive';
}

// Estados oficiales de las Citas
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Cita de cliente
export interface AppointmentItem {
  id: string;
  client_id?: string | null;
  client_name?: string | null;
  barber_id?: string | null;
  barber_name?: string | null;
  service_id?: string | null;
  service_name?: string | null;
  service_price?: number | null;
  service_duration?: number | null;
  date: string; // Formato YYYY-MM-DD
  start_time: string; // Formato HH:mm
  end_time: string; // Formato HH:mm
  status: AppointmentStatus;
  qr_code?: string | null;
  notes?: string | null;
  created_at: string;
}

// Catálogo de Productos (Tienda)
export interface ProductItem {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  sale_price: number;
  stock: number;
  image_url?: string | null;
  is_active: boolean;
}

// Ítem dentro del Carrito de Compras
export interface CartItem {
  product: ProductItem;
  quantity: number;
}