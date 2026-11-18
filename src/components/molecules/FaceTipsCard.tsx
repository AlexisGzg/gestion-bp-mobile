import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Sun, Eye, UserCheck, Sparkles } from 'lucide-react-native';

export const FaceTipsCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkles size={16} color={colors.primary[500]} />
        <Text style={styles.title}>Consejos para un análisis óptimo</Text>
      </View>

      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Sun size={14} color={colors.primary[500]} style={styles.icon} />
          <Text style={styles.tipText}>
            Buena iluminación frontal; evita contraluces y sombras marcadas.
          </Text>
        </View>

        <View style={styles.tipItem}>
          <Eye size={14} color={colors.primary[500]} style={styles.icon} />
          <Text style={styles.tipText}>
            Mira de frente a la cámara con expresión natural y mentón nivelado.
          </Text>
        </View>

        <View style={styles.tipItem}>
          <UserCheck size={14} color={colors.primary[500]} style={styles.icon} />
          <Text style={styles.tipText}>
            Retira gafas oscuras, gorras o cabello que cubra la frente y barbilla.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    ...typography.caption,
    color: colors.text.heading,
    fontFamily: typography.family.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  icon: {
    marginTop: 2,
  },
  tipText: {
    ...typography.caption,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 18,
  },
});
