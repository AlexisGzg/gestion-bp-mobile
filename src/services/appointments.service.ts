import { supabase } from '../lib/supabase';
import { AppointmentItem } from '../types';

interface CreateAppointmentParams {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;       // Formato 'YYYY-MM-DD'
  startTime: string;  // Formato 'HH:mm'
  notes?: string;
}

export const AppointmentsService = {
  // Obtener las citas del cliente autenticado
  async getMyAppointments(clientId: string): Promise<AppointmentItem[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) throw error;
    return (data || []) as AppointmentItem[];
  },

  // Crear una nueva cita y generar su código QR compatible con el escáner web
  async createAppointment(params: CreateAppointmentParams): Promise<AppointmentItem> {
    // Calcular hora de fin sumando la duración en minutos
    const [hours, minutes] = params.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + params.serviceDuration;
    const endH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const endM = String(totalMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    // Generar código QR único con formato BP-XXXXXXXX-XXXX
    const tsBase = Date.now().toString(36).toUpperCase().slice(-8).padStart(8, '0');
    const rndBase = Math.random().toString(36).substring(2, 6).toUpperCase().padEnd(4, '0');
    const qrCode = `BP-${tsBase}-${rndBase}`;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: params.clientId,
        client_type: 'registered',
        client_name: params.clientName,
        client_email: params.clientEmail,
        client_phone: params.clientPhone || null,
        barber_id: params.barberId,
        barber_name: params.barberName,
        service_id: params.serviceId,
        service_name: params.serviceName,
        service_price: params.servicePrice,
        service_duration: params.serviceDuration,
        date: params.date,
        start_time: params.startTime,
        end_time: endTime,
        status: 'pending',
        qr_code: qrCode,
        notes: params.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AppointmentItem;
  },

  // Cancelar una cita
  async cancelAppointment(appointmentId: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) throw error;
  },
};