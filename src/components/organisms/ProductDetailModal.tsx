import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Image } from 'react-native';
import { X, ShoppingBag } from 'lucide-react-native';
import { ProductItem } from '../../types';
import { Button } from '../atoms/Button';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const visible = !!product;

  const handleAdd = () => {
    if (product) {
      onAddToCart(product);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.headerLabel}>Detalles producto</Text>
              <Text style={styles.headerCategory}>{product?.category}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Imagen */}
            <View style={styles.imageWrapper}>
              {product?.image_url ? (
                <Image
                  source={{ uri: product.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <ShoppingBag size={48} color={colors.primary[300]} />
              )}
            </View>

            {/* Nombre + stock */}
            <View style={styles.titleBlock}>
              <Text style={styles.name}>{product?.name}</Text>
              <Text style={styles.stock}>Stock disponible: {product?.stock} unidades</Text>
            </View>

            {/* Descripción */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Descripción</Text>
              <Text style={styles.descriptionText}>
                {product?.description || 'Este artículo no cuenta con descripción detallada en este momento.'}
              </Text>
            </View>

            {/* Precio */}
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Precio de venta</Text>
              <Text style={styles.priceText}>${product?.sale_price} MXN</Text>
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <Button
                title="Cerrar"
                variant="outline"
                onPress={onClose}
                style={styles.actionButton}
              />
              <Button
                title={product && product.stock <= 0 ? 'Agotado' : 'Agregar'}
                onPress={handleAdd}
                disabled={!product || product.stock <= 0}
                icon={<ShoppingBag size={16} color={colors.primary[50]} />}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(55, 27, 17, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
  },
  headerCategory: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  body: {
    padding: 20,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 16,
    alignSelf: 'center',
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    ...typography.h3,
    color: colors.text.heading,
    textAlign: 'center',
  },
  stock: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 4,
  },
  descriptionBox: {
    marginTop: 18,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  descriptionLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.text.muted,
  },
  descriptionText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 6,
    lineHeight: 18,
  },
  priceBox: {
    backgroundColor: colors.primary[700],
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 14,
  },
  priceLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.primary[200],
  },
  priceText: {
    ...typography.h2,
    color: colors.primary[50],
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
  },
});
