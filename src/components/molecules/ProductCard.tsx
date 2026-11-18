import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ProductItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';
import { ShoppingBag, Plus } from 'lucide-react-native';

interface ProductCardProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem) => void;
  onPress: (product: ProductItem) => void;
}

export const ProductCard = React.memo<ProductCardProps>(({ product, onAddToCart, onPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.9}
      onPress={() => onPress(product)}
    >
      <View style={styles.cardInner}>
        <View style={[styles.imageContainer, { backgroundColor: colors.cardAlt }]}>
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <ShoppingBag size={32} color={colors.primary[300]} />
          )}
        </View>

        <View style={styles.content}>
          <Text style={[styles.category, { color: colors.text.muted }]} numberOfLines={1}>
            {product.category}
          </Text>
          <Text style={[styles.name, { color: colors.text.heading }]} numberOfLines={2}>
            {product.name}
          </Text>
          {product.description ? (
            <Text style={[styles.description, { color: colors.text.secondary }]} numberOfLines={2}>
              {product.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <Text style={[styles.price, { color: colors.primary[500] }]}>${product.sale_price}</Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary[500] }]}
              activeOpacity={0.8}
              onPress={() => onAddToCart(product)}
            >
              <Plus size={16} color={isDark ? colors.primary[950] : colors.primary[50]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
  },
  cardInner: {
    overflow: 'hidden',
    borderRadius: 18,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
  },
  category: {
    ...typography.caption,
    fontSize: 9,
    fontFamily: typography.family.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    ...typography.body,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    minHeight: 36,
  },
  description: {
    ...typography.caption,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    ...typography.h3,
    fontSize: 15,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
