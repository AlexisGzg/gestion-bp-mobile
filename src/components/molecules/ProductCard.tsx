import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ProductItem } from '../../types';
import { Button } from '../atoms/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ShoppingBag } from 'lucide-react-native';

interface ProductCardProps {
  product: ProductItem;
  onAddToCart: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <ShoppingBag size={32} color={colors.primary[300]} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>${product.sale_price} MXN</Text>

        <Button
          title="Agregar"
          onPress={() => onAddToCart(product)}
          variant="outline"
          style={styles.addButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  category: {
    ...typography.caption,
    color: colors.primary[400],
    textTransform: 'uppercase',
  },
  name: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.heading,
    marginTop: 2,
    minHeight: 36,
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary[500],
    marginVertical: 6,
  },
  addButton: {
    height: 36,
    borderRadius: 8,
  },
});
