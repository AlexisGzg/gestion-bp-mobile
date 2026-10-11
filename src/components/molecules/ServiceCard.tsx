import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ServiceItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Scissors, Clock } from 'lucide-react-native';

interface ServiceCardProps {
  service: ServiceItem;
  selected?: boolean;
  onSelect: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, selected = false, onSelect }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(service)}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
          <Scissors size={20} color={selected ? colors.primary[50] : colors.primary[500]} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{service.name}</Text>
          {service.description && (
            <Text style={styles.desc} numberOfLines={1}>{service.description}</Text>
          )}
          <View style={styles.durationRow}>
            <Clock size={12} color={colors.text.muted} />
            <Text style={styles.duration}>{service.duration} mins</Text>
          </View>
        </View>
      </View>

      <Text style={styles.price}>${service.price}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxSelected: {
    backgroundColor: colors.primary[500],
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.heading,
  },
  desc: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  duration: {
    ...typography.caption,
    color: colors.text.muted,
  },
  price: {
    ...typography.h3,
    color: colors.primary[500],
    marginLeft: 8,
  },
});