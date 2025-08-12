import React, { useEffect, useState, Suspense, useContext, useCallback } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet, Alert, Text } from "react-native";
import NetInfo from '@react-native-community/netinfo';
import { fetchProductsFromApi } from "../api/products";
import { handleAddToCart } from "../notification/AddToCardNotification";
import { CartContext } from "../store/CartContext";
import { 
  createProductsTable, 
  saveProductsToDb, 
  loadProductsFromDb,
  getProductCount 
} from "../database/sqliteService";

const ProductCard = React.lazy(() => import("../components/ProductCard"));

export default function ProductListScreen({ navigation }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const limit = 20;
  const { addToCart } = useContext(CartContext);

  // Initialize database and check network status
  useEffect(() => {
    const init = async () => {
      try {
        await createProductsTable();
        setIsInitialized(true);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
        Alert.alert('Database Error', 'Failed to initialize database');
      }
    };
    init();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      console.log('Network status changed:', connected ? 'Online' : 'Offline');
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const loadProducts = useCallback(async (reset = false) => {
    if (!isInitialized) {
      console.log('Database not initialized yet, skipping load');
      return;
    }

    try {
      if (reset) {
        setLoading(true);
        setSkip(0);
      } else {
        setLoadingMore(true);
      }

      if (isOnline) {
        console.log('Loading products online...');
        // Try to fetch from API first
        const data = await fetchProductsFromApi(limit, reset ? 0 : skip);
        
        if (reset) {
          setProducts(data.products);
          // Save all products to database (replacing existing ones)
          if (data.products.length > 0) {
            await saveProductsToDb(data.products);
          }
        } else {
          setProducts(prev => [...prev, ...data.products]);
          // Note: For pagination, you might want to append to existing data
          // instead of replacing. Consider implementing an "upsert" function
        }
        
        setTotal(data.total);
        setSkip(prev => prev + limit);
        
      } else {
        console.log('Loading products offline...');
        // Offline mode - load from SQLite
        const dbProducts = await loadProductsFromDb();
        const cachedCount = await getProductCount();
        
        if (reset) {
          setProducts(dbProducts);
          setTotal(cachedCount);
          setSkip(cachedCount);
        } else {
          // For offline pagination, slice the cached results
          const startIndex = products.length;
          const endIndex = startIndex + limit;
          const nextBatch = dbProducts.slice(startIndex, endIndex);
          
          if (nextBatch.length > 0) {
            setProducts(prev => [...prev, ...nextBatch]);
            setSkip(prev => prev + nextBatch.length);
          }
          setTotal(cachedCount);
        }
        
        if (cachedCount === 0) {
          Alert.alert("Offline", "No cached products available. Please connect to the internet to load products.");
        } else {
          console.log(`Loaded ${cachedCount} cached products`);
        }
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      
      // If online fetch fails, try to load from cache as fallback
      if (isOnline) {
        try {
          console.log('API failed, trying to load from cache...');
          const dbProducts = await loadProductsFromDb();
          const cachedCount = await getProductCount();
          
          if (cachedCount > 0) {
            Alert.alert("Network Error", "Unable to fetch latest data. Showing cached products.");
            
            if (reset) {
              setProducts(dbProducts);
              setTotal(cachedCount);
              setSkip(cachedCount);
            } else {
              const startIndex = products.length;
              const endIndex = startIndex + limit;
              const nextBatch = dbProducts.slice(startIndex, endIndex);
              
              if (nextBatch.length > 0) {
                setProducts(prev => [...prev, ...nextBatch]);
                setSkip(prev => prev + nextBatch.length);
              }
              setTotal(cachedCount);
            }
          } else {
            Alert.alert("Error", "Unable to load products. Please check your internet connection.");
          }
        } catch (cacheError) {
          console.error("Failed to load from cache:", cacheError);
          Alert.alert("Error", "Unable to load products from any source.");
        }
      } else {
        Alert.alert("Offline Error", "Failed to load cached products. Please check your internet connection.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isInitialized, isOnline, skip, limit, products.length]);

  // Load products when database is initialized or network status changes
  useEffect(() => {
    if (isInitialized) {
      loadProducts(true);
    }
  }, [isInitialized, isOnline]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && products.length < total && products.length > 0) {
      console.log('Loading more products...', { currentCount: products.length, total });
      loadProducts(false);
    }
  }, [loadingMore, products.length, total, loadProducts]);

  const handleAdd = useCallback((item: any) => {
    addToCart(item);
    handleAddToCart(item);
  }, [addToCart]);

  const renderProduct = useCallback(({ item }: { item: any }) => (
    <Suspense fallback={<ActivityIndicator size="small" color="tomato" />}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        onAddToCart={() => handleAdd(item)}
      />
    </Suspense>
  ), [navigation, handleAdd]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="tomato" />
        <Text style={styles.footerText}>Loading more products...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {isOnline ? 'No products found' : 'No cached products available'}
        </Text>
        {!isOnline && (
          <Text style={styles.emptySubtext}>
            Connect to the internet to load products
          </Text>
        )}
      </View>
    );
  }, [loading, isOnline]);

  if (loading && products.length === 0) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="tomato" />
        <Text style={styles.loaderText}>
          {isOnline ? 'Loading products...' : 'Loading cached products...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📱 Offline Mode - Showing cached data</Text>
        </View>
      )}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item, index) =>index.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#f5f5f5',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  list: { 
    paddingHorizontal: 8, 
    paddingTop: 10,
    paddingBottom: 20,
  },
  empty: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  offlineBanner: {
    backgroundColor: '#fff3cd',
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
    padding: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 14,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});