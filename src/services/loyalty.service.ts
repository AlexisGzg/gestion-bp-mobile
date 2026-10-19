import { supabase } from '../lib/supabase';
import { ClientReward, ClientLoyaltySummary, LoyaltyConfig } from '../types';

// Configuración por defecto si no hay una activa en `loyalty_config`
const DEFAULT_VISITS_REQUIRED = 4;

export const LoyaltyService = {
  // Configuración activa del programa de fidelidad
  async getLoyaltyConfig(): Promise<LoyaltyConfig | null> {
    const { data, error } = await supabase
      .from('loyalty_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) return null;
    return (data as LoyaltyConfig) || null;
  },

  // Recompensas pendientes (sin reclamar) del cliente
  async getPendingRewards(clientId: string): Promise<ClientReward[]> {
    const { data, error } = await supabase
      .from('client_rewards')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('earned_at', { ascending: false });

    if (error) return [];
    return (data || []) as ClientReward[];
  },

  // Resumen de fidelidad del cliente (mismo cálculo que la web)
  async getClientLoyaltySummary(params: {
    clientId: string;
    clientName: string;
    currentVisits: number;
    totalVisits: number;
    points: number;
  }): Promise<ClientLoyaltySummary> {
    const { clientId, clientName, currentVisits, totalVisits, points } = params;

    const [config, pendingRewards] = await Promise.all([
      this.getLoyaltyConfig(),
      this.getPendingRewards(clientId),
    ]);

    const visitsRequired = config?.visits_required ?? DEFAULT_VISITS_REQUIRED;
    const visitProgress = Math.min((currentVisits / visitsRequired) * 100, 100);
    const claimedRewards =
      totalVisits > 0
        ? Math.max(Math.floor(totalVisits / visitsRequired) - pendingRewards.length, 0)
        : 0;

    return {
      clientId,
      clientName,
      currentVisits,
      visitsRequired,
      visitProgress,
      totalVisits,
      points,
      pendingRewards,
      claimedRewards,
      nextRewardDescription: config?.reward_description ?? null,
    };
  },
};
