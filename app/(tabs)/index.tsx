import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { ProductCard } from '../../src/components/molecules/ProductCard';
import { CatalogService } from '../../src/services/catalog.service';
import { ProductItem } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { ShoppingBag } from 'lucide-react-native';

export default function ShopScreen() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        CatalogService.getCategories(),
        CatalogService.getProducts(selectedCategory),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleAddToCart = (product: ProductItem) => {
    Alert.alert('Producto agregado', `${product.name} se agregó a tu pedido.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tienda Barber Pro</Text>
        <Text style={styles.subtitle}>Productos profesionales para tu cuidado</Text>
      </View>

      {/* Filtro de Categorías */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isSelected = item === selectedCategory;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Grid de Productos */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <ShoppingBag size={48} color={colors.primary[300]} />
          <Text style={styles.emptyText}>No hay productos disponibles en esta categoría</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productsList}
          renderItem={({ item }) => <ProductCard product={item} onAddToCart={handleAddToCart} />}
          onRefresh={loadData}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
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
  categoriesWrapper: {
    marginVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text.primary,
  },
  categoryTextActive: {
    color: colors.primary[50],
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
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
});