import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gift, Check, Crown, Sparkles } from 'lucide-react-native';
import { ClientLoyaltySummary } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface LoyaltyProgressProps {
  summary: ClientLoyaltySummary;
  compact?: boolean;
}

// Ámbar de recompensa (web: #f59e0b → #d97706)
const REWARD_GOLD = '#D19C3E';
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
          nextRewardDescription ? nextRewardDescription : 'tu próximo servicio de cortesía'
        }!`
      : pendingRewards.length > 0
        ? `¡Tienes ${pendingRewards.length} recompensa${
            pendingRewards.length > 1 ? 's' : ''
          } exclusiva${pendingRewards.length > 1 ? 's' : ''} disponible${pendingRewards.length > 1 ? 's' : ''}!`
        : '¡Felicidades, completaste tu ciclo de visitas!';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <View style={styles.tagRow}>
            <Crown size={12} color={colors.primary[500]} />
            <Text style={styles.tagText}>MEMBRESÍA VIP</Text>
          </View>
          <Text style={styles.title}>Pasaporte de Fidelidad</Text>
        </View>
        {pendingRewards.length > 0 && (
          <View style={styles.rewardsAvailable}>
            <Sparkles size={13} color={colors.primary[50]} />
            <Text style={styles.rewardsAvailableText}>
              {pendingRewards.length} {pendingRewards.length > 1 ? 'Recompensas' : 'Recompensa'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>SELLOS ACUMULADOS</Text>
        <Text style={styles.progressCount}>
          <Text style={styles.countEmphasized}>{currentVisits}</Text>
          <Text style={styles.countTotal}> / {visitsRequired} visitas</Text>
        </Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${visitProgress}%` }]} />
      </View>

      <Text style={styles.hint}>{hint}</Text>

      {/* FICHAS / SELLOS ACUÑADOS DE BARBERÍA */}
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
                isReward && !completed && styles.indicatorRewardPending,
                isReward && completed && styles.indicatorRewardCompleted,
              ]}
            >
              {isReward ? (
                <Crown size={18} color={completed ? colors.white : colors.primary[500]} />
              ) : completed ? (
                <Check size={16} color={colors.white} strokeWidth={2.8} />
              ) : (
                <Text style={styles.indicatorText}>{i + 1}</Text>
              )}
            </View>
          );
        })}
      </View>

      {pendingRewards.length > 0 && (
        <View style={styles.pending}>
          <Text style={styles.pendingTitle}>RECOMPENSAS ACTIVAS</Text>
          {pendingRewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardIconBox}>
                <Gift size={20} color={colors.primary[500]} />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardDescription}>{reward.reward_description}</Text>
                {reward.expires_at ? (
                  <Text style={styles.rewardExpiry}>
                    Vigencia hasta: {new Date(reward.expires_at).toLocaleDateString('es-MX')}
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
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    shadowColor: colors.primary[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  rewardsAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardsAvailableText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.text.muted,
    letterSpacing: 1.2,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  countEmphasized: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
  },
  countTotal: {
    fontSize: 12,
    fontFamily: typography.family.medium,
    color: colors.text.secondary,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  hint: {
    fontSize: 12,
    fontFamily: typography.family.medium,
    color: colors.text.secondary,
    marginTop: 10,
    lineHeight: 18,
  },
  indicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    justifyContent: 'flex-start',
  },
  indicator: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  indicatorCompleted: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[300],
    shadowColor: colors.primary[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorRewardPending: {
    borderColor: REWARD_GOLD,
    borderStyle: 'dashed',
    backgroundColor: colors.cardAlt,
  },
  indicatorRewardCompleted: {
    backgroundColor: REWARD_GOLD,
    borderColor: colors.primary[200],
    shadowColor: REWARD_GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorText: {
    fontSize: 12,
    fontFamily: typography.family.bold,
    color: colors.text.muted,
  },
  pending: {
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: colors.divider,
    paddingTop: 14,
  },
  pendingTitle: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardDescription: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: colors.text.heading,
  },
  rewardExpiry: {
    fontSize: 11,
    fontFamily: typography.family.medium,
    color: colors.text.secondary,
    marginTop: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.text.secondary,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactBadgeText: {
    fontSize: 10,
    fontFamily: typography.family.bold,
    color: colors.primary[500],
  },
});
