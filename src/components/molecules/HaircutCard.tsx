import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Haircut } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  Scissors,
  MessageSquareQuote,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react-native';

interface HaircutCardProps {
  haircut: Haircut;
  clientPhotoUri?: string | null;
  onBookHaircut?: (haircut: Haircut) => void;
  onCopyPhrase?: (phrase: string) => void;
}

type AngleView = 'front' | 'side' | 'back';

export const HaircutCard: React.FC<HaircutCardProps> = ({
  haircut,
  clientPhotoUri,
  onBookHaircut,
  onCopyPhrase,
}) => {
  const [activeAngle, setActiveAngle] = useState<AngleView>('front');
  const [showComparison, setShowComparison] = useState(false);

  const getActiveImageUri = () => {
    switch (activeAngle) {
      case 'side':
        return haircut.images.side;
      case 'back':
        return haircut.images.back;
      case 'front':
      default:
        return haircut.images.front;
    }
  };

  return (
    <View style={styles.card}>
      {/* Cabecera del corte */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{haircut.name}</Text>
          <Text style={styles.subtitle}>{haircut.subtitle}</Text>
        </View>
        <View style={styles.badge}>
          <Scissors size={12} color={colors.primary[50]} />
          <Text style={styles.badgeText}>Recomendado</Text>
        </View>
      </View>

      {/* Selector de ángulos: Frente, Lado, Atrás + Comparar */}
      <View style={styles.anglesRow}>
        <View style={styles.anglesTabs}>
          {(['front', 'side', 'back'] as AngleView[]).map((angle) => {
            const isSelected = activeAngle === angle && !showComparison;
            const label = angle === 'front' ? 'Frente' : angle === 'side' ? 'Lado' : 'Atrás';

            return (
              <TouchableOpacity
                key={angle}
                activeOpacity={0.8}
                onPress={() => {
                  setShowComparison(false);
                  setActiveAngle(angle);
                }}
                style={[styles.angleTab, isSelected && styles.angleTabActive]}
              >
                <Text
                  style={[
                    styles.angleTabText,
                    isSelected && styles.angleTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {clientPhotoUri ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowComparison(!showComparison)}
            style={[
              styles.compareButton,
              showComparison && styles.compareButtonActive,
            ]}
          >
            <Layers size={13} color={showComparison ? colors.primary[50] : colors.text.secondary} />
            <Text
              style={[
                styles.compareButtonText,
                showComparison && styles.compareButtonTextActive,
              ]}
            >
              Comparar
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Visor de Fotos */}
      {showComparison && clientPhotoUri ? (
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonBox}>
            <Image
              source={{ uri: clientPhotoUri }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
            <View style={styles.comparisonLabel}>
              <Text style={styles.comparisonLabelText}>Tu rostro</Text>
            </View>
          </View>
          <View style={styles.comparisonBox}>
            <Image
              source={{ uri: getActiveImageUri() }}
              style={styles.comparisonImage}
              resizeMode="cover"
            />
            <View style={styles.comparisonLabel}>
              <Text style={styles.comparisonLabelText}>{haircut.name}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getActiveImageUri() }}
            style={styles.haircutImage}
            resizeMode="cover"
          />
          <View style={styles.viewBadge}>
            <Text style={styles.viewBadgeText}>
              Vista {activeAngle === 'front' ? 'Frontal' : activeAngle === 'side' ? 'Lateral' : 'Posterior'}
            </Text>
          </View>
        </View>
      )}

      {/* Descripción técnica */}
      <Text style={styles.description}>{haircut.description}</Text>

      {/* Tarjeta destacada: Cómo pedírselo al barbero */}
      <View style={styles.phraseCard}>
        <View style={styles.phraseHeader}>
          <MessageSquareQuote size={18} color={colors.primary[500]} />
          <Text style={styles.phraseTitle}>Dile esto a tu barbero:</Text>
        </View>
        <Text style={styles.phraseText}>{haircut.howToAsk}</Text>

        {onCopyPhrase ? (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.copyButton}
            onPress={() => onCopyPhrase(haircut.howToAsk)}
          >
            <Text style={styles.copyButtonText}>Copiar frase</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Detalles adicionales: Mantenimiento y Producto */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Mantenimiento</Text>
          <Text style={styles.metaValue}>{haircut.maintenanceLevel}</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Fijación recomendada</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {haircut.recommendedStylingProduct}
          </Text>
        </View>
      </View>

      {/* Teaser IA futura */}
      <View style={styles.aiTeaser}>
        <Sparkles size={14} color={colors.primary[500]} />
        <Text style={styles.aiTeaserText}>
          Fase futura: Simulación virtual sobre tu fotografía
        </Text>
      </View>

      {/* Botón de Reservar este corte */}
      {onBookHaircut ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.bookButton}
          onPress={() => onBookHaircut(haircut)}
        >
          <Calendar size={18} color={colors.primary[50]} />
          <Text style={styles.bookButtonText}>Reservar este corte</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    ...typography.h2,
    color: colors.text.heading,
    fontSize: 18,
    fontFamily: typography.family.bold,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
  anglesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  anglesTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  angleTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  angleTabActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  angleTabText: {
    fontSize: 11,
    color: colors.text.primary,
    fontFamily: typography.family.medium,
  },
  angleTabTextActive: {
    color: colors.primary[50],
    fontFamily: typography.family.bold,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  compareButtonText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontFamily: typography.family.semiBold,
  },
  compareButtonTextActive: {
    color: colors.primary[50],
  },
  imageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardAlt,
    marginBottom: 14,
  },
  haircutImage: {
    width: '100%',
    height: '100%',
  },
  viewBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(55, 27, 17, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  viewBadgeText: {
    fontSize: 11,
    color: colors.primary[50],
    fontFamily: typography.family.medium,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 200,
    marginBottom: 14,
  },
  comparisonBox: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  comparisonImage: {
    width: '100%',
    height: '100%',
  },
  comparisonLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(55, 27, 17, 0.85)',
    borderRadius: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  comparisonLabelText: {
    fontSize: 10,
    color: colors.primary[50],
    fontFamily: typography.family.semiBold,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text.primary,
    lineHeight: 19,
    marginBottom: 14,
  },
  phraseCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  phraseTitle: {
    fontSize: 13,
    color: colors.text.heading,
    fontFamily: typography.family.bold,
  },
  phraseText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  copyButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  copyButtonText: {
    fontSize: 11,
    color: colors.primary[600],
    fontFamily: typography.family.medium,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
    marginHorizontal: 10,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    fontFamily: typography.family.semiBold,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 12,
    color: colors.text.heading,
    fontFamily: typography.family.medium,
    marginTop: 2,
  },
  aiTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 14,
    paddingVertical: 4,
  },
  aiTeaserText: {
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: typography.family.regular,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    color: colors.primary[50],
  },
});
