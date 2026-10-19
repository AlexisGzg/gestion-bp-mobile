import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ProductItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ShoppingBag, Plus } from 'lucide-react-native';

interface ProductCardProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem) => void;
  onPress: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(product)}>
      <View style={styles.cardInner}>
        <View style={styles.imageContainer}>
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
          <Text style={styles.category} numberOfLines={1}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.price}>${product.sale_price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => onAddToCart(product)}
            >
              <Plus size={16} color={colors.primary[50]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
    flex: 1,
  },
  category: {
    ...typography.caption,
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.heading,
    marginTop: 2,
  },
  description: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary[500],
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
