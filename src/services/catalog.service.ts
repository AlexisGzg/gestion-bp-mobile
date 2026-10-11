import { supabase } from '../lib/supabase';
import { ServiceItem, BarberItem, ProductItem } from '../types';

export const CatalogService = {
  // Obtener todos los servicios activos (Corte, Barba, etc.)
  async getServices(): Promise<ServiceItem[]> {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, duration, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as ServiceItem[];
  },

  // Obtener barberos activos con su perfil
  async getBarbers(): Promise<BarberItem[]> {
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
  },

  // Obtener productos activos para la Tienda
  async getProducts(category?: string): Promise<ProductItem[]> {
    let query = supabase
      .from('products')
      .select('id, name, description, category, sale_price, stock, image_url, is_active')
      .eq('is_active', true)
      .gt('stock', 0); // Solo productos con existencia

    if (category && category !== 'Todos') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return (data || []) as ProductItem[];
  },

  // Obtener categorías únicas de productos
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) return ['Todos'];
    const unique = Array.from(new Set((data || []).map((p: any) => p.category).filter(Boolean)));
    return ['Todos', ...unique];
  },
};