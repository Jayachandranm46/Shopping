import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../utils/common";

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage?: number;
    thumbnail: string;
  };
  onPress: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} />
      {product.discountPercentage ? (
        <View style={styles.discountTag}>
          <Text style={styles.discountText}>-{product.discountPercentage}%</Text>
        </View>
      ) : null}
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.title}>
          {product.title}
        </Text>
      <Text numberOfLines={1} style={styles.price}>
  {formatCurrency(product.price)}
</Text>

      </View>
      <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
        <Ionicons name="cart" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 6,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    height: 120,
    width: "100%",
    resizeMode: "cover",
  },
  discountTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "tomato",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  details: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  price: {
    fontSize: 14,
    color: "tomato",
    fontWeight: "600",
    marginTop: 2,
  },
  cartButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "tomato",
    padding: 8,
    borderRadius: 50,
    elevation: 2,
  },
});
