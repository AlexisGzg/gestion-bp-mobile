import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Platform,
} from 'react-native';
import { ProductCard } from '../../src/components/molecules/ProductCard';
import { ProductDetailModal } from '../../src/components/organisms/ProductDetailModal';
import { CheckoutModal } from '../../src/components/organisms/CheckoutModal';
import { CatalogService } from '../../src/services/catalog.service';
import { ProductItem, CartItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { useAlert } from '../../src/context/AlertContext';
import { useTheme } from '../../src/context/ThemeContext';
import { ShoppingBag, Search, Sparkles, CreditCard, ArrowRight } from 'lucide-react-native';

const PRICE_RANGES = [
  { value: 'all', label: 'Todos' },
  { value: '0-50', label: 'Hasta $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200+', label: 'Más de $200' },
];

const FILTER_BY_PRICE: Record<string, (price: number) => boolean> = {
  '0-50': (price) => price <= 50,
  '50-100': (price) => price > 50 && price <= 100,
  '100-200': (price) => price > 100 && price <= 200,
  '200+': (price) => price > 200,
};

export default function ShopScreen() {
  const { showAlert } = useAlert();
  const { colors, isDark } = useTheme();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartRef = useRef<CartItem[]>([]);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const prods = await CatalogService.getProducts(undefined, forceRefresh);
      const uniqueCategories = Array.from(
        new Set(prods.map((product) => product.category).filter(Boolean))
      );
      setCategories(['Todos', ...uniqueCategories]);
      setProducts(prods);
    } catch {
      showAlert({
        title: 'Error de catálogo',
        message: 'No se pudieron cargar los productos de la tienda.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        (product.description?.toLowerCase().includes(search) ?? false);
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesPrice =
        selectedPrice === 'all' || (FILTER_BY_PRICE[selectedPrice]?.(product.sale_price) ?? true);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, selectedPrice]);

  const updateCart = useCallback((nextCart: CartItem[]) => {
    cartRef.current = nextCart;
    setCart(nextCart);
  }, []);

  const handleAddToCart = useCallback((product: ProductItem) => {
    const currentCart = cartRef.current;
    const existing = currentCart.find((item) => item.product.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      showAlert({
        title: 'Stock insuficiente',
        message: `Solo hay ${product.stock} unidades disponibles de "${product.name}".`,
        type: 'warning',
      });
      return;
    }

    updateCart(existing
      ? currentCart.map((item) => item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1, product }
        : item)
      : [...currentCart, { product, quantity: 1 }]);
  }, [showAlert, updateCart]);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    updateCart(cartRef.current.flatMap((item) => {
      if (item.product.id !== productId) return [item];
      const quantity = item.quantity + delta;
      if (quantity <= 0) return [];
      return [{ ...item, quantity: Math.min(quantity, item.product.stock) }];
    }));
  }, [updateCart]);

  const handleRemoveItem = useCallback((productId: string) => {
    updateCart(cartRef.current.filter((item) => item.product.id !== productId));
  }, [updateCart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSuccess = useCallback((ticketNumber: string, total: number) => {
    updateCart([]);
    setCheckoutVisible(false);
    showAlert({
      title: 'Pago recibido',
      message: `Tu pago fue procesado correctamente. Tu número de pedido es ${ticketNumber} por $${total.toFixed(2)} MXN.`,
      type: 'success',
    });
  }, [showAlert, updateCart]);

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.heading }]}>Boutique & Productos</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Pomadas, ceras, tónicos y cuidado profesional para barbería
        </Text>
      </View>

      {/* Buscador refinado */}
      <View
        style={[
          styles.searchWrapper,
          {
            backgroundColor: isDark ? colors.cardAlt : colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Search size={18} color={colors.primary[500]} />
        <TextInput
          style={[styles.searchInput, { color: colors.text.primary }]}
          placeholder="Buscar producto, marca o fijador..."
          placeholderTextColor={isDark ? colors.text.muted : colors.primary[400]}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
      </View>

      {/* Filtro: Categoría */}
      <Text style={[styles.filterLabel, { color: colors.text.muted }]}>CATEGORÍAS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {categories.map((item) => {
          const isSelected = item === selectedCategory;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.chip,
                { backgroundColor: colors.cardAlt, borderColor: colors.border },
                isSelected && {
                  backgroundColor: colors.primary[500],
                  borderColor: colors.primary[400],
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.text.primary },
                  isSelected && { color: isDark ? colors.primary[950] : colors.primary[50], fontWeight: '700' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filtro: Precio */}
      <Text style={[styles.filterLabel, { color: colors.text.muted }]}>RANGO DE PRECIO</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {PRICE_RANGES.map((range) => {
          const isSelected = range.value === selectedPrice;
          return (
            <TouchableOpacity
              key={range.value}
              activeOpacity={0.8}
              onPress={() => setSelectedPrice(range.value)}
              style={[
                styles.chip,
                { backgroundColor: colors.cardAlt, borderColor: colors.border },
                isSelected && {
                  backgroundColor: colors.primary[500],
                  borderColor: colors.primary[400],
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.text.primary },
                  isSelected && { color: isDark ? colors.primary[950] : colors.primary[50], fontWeight: '700' },
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!loading && (
        <Text style={[styles.resultsCount, { color: colors.text.secondary }]}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar fija y elegante */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.topBarIconBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
            <ShoppingBag size={18} color={colors.primary[500]} />
          </View>
          <View>
            <Text style={[styles.topBarSuper, { color: colors.primary[500] }]}>GESTIÓN BARBER PRO</Text>
            <Text style={[styles.topBarTitle, { color: colors.text.heading }]}>Boutique & Cuidado</Text>
          </View>
        </View>

        <View style={[styles.topBarBadge, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <Sparkles size={12} color={colors.primary[500]} />
          <Text style={[styles.topBarBadgeText, { color: colors.text.heading }]}>
            {filteredProducts.length} items
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.productsList, styles.productsListWithCart]}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} onPress={setSelectedProduct} />
        )}
        onRefresh={() => void loadData(true)}
        refreshing={loading}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
              <ShoppingBag size={48} color={colors.primary[300]} />
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                No hay productos disponibles con los filtros seleccionados
              </Text>
            </View>
          )
        }
      />

      <View style={[styles.cartBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.cartCount, { color: colors.text.secondary }]}>
            {cartQuantity} {cartQuantity === 1 ? 'artículo' : 'artículos'}
          </Text>
          <Text style={[styles.cartTotal, { color: colors.text.heading }]}>
            ${cartTotal.toFixed(2)} MXN
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { backgroundColor: colors.primary[500] },
            cart.length === 0 && styles.disabledCheckoutButton,
          ]}
          onPress={() => setCheckoutVisible(true)}
          disabled={cart.length === 0}
          activeOpacity={0.85}
        >
          <CreditCard size={16} color={colors.primary[50]} />
          <Text style={[styles.checkoutButtonText, { color: colors.primary[50] }]}>Pagar</Text>
          <ArrowRight size={16} color={colors.primary[50]} />
        </TouchableOpacity>
      </View>

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <CheckoutModal
        visible={checkoutVisible}
        cart={cart}
        onClose={() => setCheckoutVisible(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSuccess={handleCheckoutSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarSuper: {
    fontSize: 9,
    fontFamily: typography.family.bold,
    letterSpacing: 1.5,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    letterSpacing: 0.3,
  },
  topBarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  topBarBadgeText: {
    fontSize: 11,
    fontFamily: typography.family.bold,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    ...typography.h1,
    color: colors.text.heading,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.family.regular,
    fontSize: 14,
    color: colors.text.heading,
    paddingVertical: 0,
  },
  filterLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  chipsRow: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  chipTextActive: {
    color: colors.primary[50],
  },
  resultsCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 18,
    marginBottom: 10,
  },
  productsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  productsListWithCart: {
    paddingBottom: 160,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 240,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 96 : 88,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderTopWidth: 1,
    borderWidth: 1,
    elevation: 8,
  },
  cartCount: {
    fontSize: 11,
    fontFamily: typography.family.medium,
  },
  cartTotal: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    marginTop: 2,
  },
  checkoutButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  checkoutButtonText: {
    fontSize: 13,
    fontFamily: typography.family.bold,
  },
  disabledCheckoutButton: {
    opacity: 0.5,
  },
});
