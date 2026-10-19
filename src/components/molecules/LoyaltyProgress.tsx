import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gift, Check } from 'lucide-react-native';
import { ClientLoyaltySummary } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface LoyaltyProgressProps {
  summary: ClientLoyaltySummary;
  compact?: boolean;
}

// Ámbar de recompensa (web: #f59e0b → #d97706)
const REWARD_GOLD = '#F59E0B';
const REWARD_TEXT = colors.status.pending; // Ámbar 700

export const LoyaltyProgress: React.FC<LoyaltyProgressProps> = ({ summary, compact = false }) => {
  const { currentVisits, visitsRequired, visitProgress, pendingRewards, nextRewardDescription } =
    summary;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${visitProgress}%` }]} />
        </View>
        <Text style={styles.compactText}>
          {currentVisits}/{visitsRequired}
        </Text>
        {pendingRewards.length > 0 && (
          <View style={styles.compactBadge}>
            <Gift size={12} color={REWARD_TEXT} />
            <Text style={styles.compactBadgeText}>{pendingRewards.length}</Text>
          </View>
        )}
      </View>
    );
  }

  const remaining = visitsRequired - currentVisits;
  const hint =
    remaining > 0
      ? `¡Solo ${remaining} visita${remaining > 1 ? 's' : ''} más para ${
          nextRewardDescription ? `obtener: ${nextRewardDescription}` : 'tu próxima recompensa'
        }!`
      : pendingRewards.length > 0
        ? `¡Tienes ${pendingRewards.length} recompensa${
            pendingRewards.length > 1 ? 's' : ''
          } disponible${pendingRewards.length > 1 ? 's' : ''}!`
        : '¡Felicidades, completaste tu ciclo de visitas!';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Fidelización</Text>
        {pendingRewards.length > 0 && (
          <View style={styles.rewardsAvailable}>
            <Gift size={14} color={REWARD_TEXT} />
            <Text style={styles.rewardsAvailableText}>
              {pendingRewards.length} recompensa{pendingRewards.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Progreso</Text>
        <Text style={styles.progressCount}>
          {currentVisits} de {visitsRequired}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${visitProgress}%` }]} />
      </View>
      <Text style={styles.hint}>{hint}</Text>

      <View style={styles.indicators}>
        {Array.from({ length: visitsRequired }).map((_, i) => {
          const isReward = i === visitsRequired - 1;
          const completed = i < currentVisits;
          return (
            <View
              key={i}
              style={[
                styles.indicator,
                completed && styles.indicatorCompleted,
                isReward && styles.indicatorReward,
              ]}
            >
              {isReward ? (
                <Gift size={16} color={colors.white} />
              ) : completed ? (
                <Check size={16} color={colors.white} />
              ) : (
                <Text style={styles.indicatorText}>{i + 1}</Text>
              )}
            </View>
          );
        })}
      </View>

      {pendingRewards.length > 0 && (
        <View style={styles.pending}>
          <Text style={styles.pendingTitle}>Recompensas disponibles</Text>
          {pendingRewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <Gift size={24} color={REWARD_TEXT} />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardDescription}>{reward.reward_description}</Text>
                {reward.expires_at ? (
                  <Text style={styles.rewardExpiry}>
                    Expira: {new Date(reward.expires_at).toLocaleDateString('es-MX')}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    ...typography.h3,
    color: colors.text.heading,
  },
  rewardsAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.statusBg.pending,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rewardsAvailableText: {
    ...typography.caption,
    color: REWARD_TEXT,
    fontWeight: '600',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  progressCount: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.status.completed,
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.status.completed,
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 8,
  },
  indicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  indicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
  },
  indicatorCompleted: {
    backgroundColor: colors.status.completed,
  },
  indicatorReward: {
    backgroundColor: REWARD_GOLD,
  },
  indicatorText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.muted,
  },
  pending: {
    marginTop: 16,
  },
  pendingTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.heading,
    marginBottom: 8,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.statusBg.pending,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardDescription: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: REWARD_TEXT,
  },
  rewardExpiry: {
    ...typography.caption,
    color: REWARD_TEXT,
    opacity: 0.8,
    marginTop: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.statusBg.pending,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compactBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: REWARD_TEXT,
  },
});
