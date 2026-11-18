import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FaceShape } from '../../types';
import { FACE_SHAPES_INFO } from '../../data/haircuts';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Check } from 'lucide-react-native';

interface FaceShapeSelectorProps {
  selectedShape: FaceShape;
  onSelectShape: (shape: FaceShape) => void;
  label?: string;
}

const ALL_SHAPES: FaceShape[] = ['ovalada', 'redonda', 'cuadrada', 'alargada', 'corazon', 'diamante'];

export const FaceShapeSelector: React.FC<FaceShapeSelectorProps> = ({
  selectedShape,
  onSelectShape,
  label = 'Ajustar o corregir forma de rostro:',
}) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {ALL_SHAPES.map((shape) => {
          const info = FACE_SHAPES_INFO[shape];
          const isSelected = shape === selectedShape;

          return (
            <TouchableOpacity
              key={shape}
              activeOpacity={0.8}
              onPress={() => onSelectShape(shape)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              {isSelected ? (
                <View style={styles.checkIcon}>
                  <Check size={12} color={colors.primary[50]} strokeWidth={3} />
                </View>
              ) : null}
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {info?.name || shape}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    ...typography.caption,
    color: colors.text.muted,
    fontFamily: typography.family.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scrollContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  chipTextActive: {
    color: colors.primary[50],
    fontFamily: typography.family.bold,
  },
});
