import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { ProductCard } from '../../src/components/molecules/ProductCard';
import { ProductDetailModal } from '../../src/components/organisms/ProductDetailModal';
import { CatalogService } from '../../src/services/catalog.service';
import { ProductItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { ShoppingBag, Search } from 'lucide-react-native';

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
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        CatalogService.getCategories(),
        CatalogService.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

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

  const handleAddToCart = (product: ProductItem) => {
    Alert.alert('Producto agregado', `${product.name} se agregó a tu pedido.`);
  };

  const listHeader = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Tienda</Text>
        <Text style={styles.subtitle}>Productos profesionales para tu cuidado</Text>
      </View>

      {/* Buscador (como la web) */}
      <View style={styles.searchWrapper}>
        <Search size={18} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.text.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
      </View>

      {/* Filtro: Categoría */}
      <Text style={styles.filterLabel}>Categorías</Text>
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
              onPress={() => setSelectedCategory(item)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filtro: Precio */}
      <Text style={styles.filterLabel}>Precio</Text>
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
              onPress={() => setSelectedPrice(range.value)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{range.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!loading && (
        <Text style={styles.resultsCount}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productsList}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} onPress={setSelectedProduct} />
        )}
        onRefresh={loadData}
        refreshing={loading}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
          ) : (
            <View style={styles.center}>
              <ShoppingBag size={48} color={colors.primary[300]} />
              <Text style={styles.emptyText}>
                No hay productos disponibles con los filtros seleccionados
              </Text>
            </View>
          )
        }
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.cardAlt,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: typography.family.regular,
    fontSize: 15,
    color: colors.text.heading,
    paddingVertical: 0,
  },
  filterLabel: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 18,
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
    paddingBottom: 20,
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
});
