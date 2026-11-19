import { supabase } from '../lib/supabase';
import { ServiceItem, BarberItem, ProductItem } from '../types';

type Cache<T> = (load: () => Promise<T>, forceRefresh?: boolean) => Promise<T>;

function createCache<T>(ttlMs: number): Cache<T> {
  let cached: { value: T; expiresAt: number } | null = null;
  let pending: Promise<T> | null = null;

  return (load, forceRefresh = false) => {
    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.value);
    }
    if (pending) return pending;

    pending = load()
      .then((value) => {
        cached = { value, expiresAt: Date.now() + ttlMs };
        return value;
      })
      .finally(() => {
        pending = null;
      });

    return pending;
  };
}

const servicesCache = createCache<ServiceItem[]>(60_000);
const barbersCache = createCache<BarberItem[]>(60_000);
const productCaches = new Map<string, Cache<ProductItem[]>>();

export const CatalogService = {
  // Obtener todos los servicios activos (Corte, Barba, etc.)
  getServices(forceRefresh = false): Promise<ServiceItem[]> {
    return servicesCache(async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, description, price, duration, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as ServiceItem[];
    }, forceRefresh);
  },

  // Obtener barberos activos con su perfil
  getBarbers(forceRefresh = false): Promise<BarberItem[]> {
    return barbersCache(async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
        id,
        status,
        specialties,
        profiles:id (
          full_name,
          avatar_url
        )
      `)
        .eq('status', 'active');

      if (error) {
        // Fallback en caso de consulta directa
        const { data: fallbackData, error: fbError } = await supabase
          .from('employees')
          .select('*')
          .eq('status', 'active');
        if (fbError) throw fbError;
        return (fallbackData || []).map((emp: any) => ({
          id: emp.id,
          full_name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Barbero BP',
          avatar_url: null,
          specialties: emp.specialties || [],
          status: emp.status,
        }));
      }

      return (data || []).map((emp: any) => ({
        id: emp.id,
        full_name: emp.profiles?.full_name || 'Barbero BP',
        avatar_url: emp.profiles?.avatar_url || null,
        specialties: emp.specialties || [],
        status: emp.status,
      }));
    }, forceRefresh);
  },

  // Obtener productos activos para la Tienda
  getProducts(category?: string, forceRefresh = false): Promise<ProductItem[]> {
    const categoryFilter = category && category !== 'Todos' ? category : '';
    let cache = productCaches.get(categoryFilter);
    if (!cache) {
      cache = createCache<ProductItem[]>(30_000);
      productCaches.set(categoryFilter, cache);
    }

    return cache(async () => {
      let query = supabase
        .from('products')
        .select('id, name, description, category, sale_price, stock, image_url, is_active')
        .eq('is_active', true)
        .gt('stock', 0);

      if (categoryFilter) query = query.eq('category', categoryFilter);

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as ProductItem[];
    }, forceRefresh);
  },
};