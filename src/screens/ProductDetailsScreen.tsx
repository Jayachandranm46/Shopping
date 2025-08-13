import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { CartContext } from "../store/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { handleAddToCart } from "../notification/AddToCardNotification";
import { formatCurrency } from "../utils/common";

type Props = {
  route: RouteProp<RootStackParamList, "ProductDetails">;
  navigation: any;
};

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { addToCart } = useContext(CartContext);

  const handlecart = () => {
    addToCart(product);
    handleAddToCart(product);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Image source={{ uri: product.thumbnail }} style={styles.image} />
        <FlatList
          data={product.images}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 10 }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.additionalImage} />
          )}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <Text numberOfLines={1} style={styles.price}>
            {formatCurrency(product.price)}
          </Text>

          {product.discountPercentage ? (
            <Text style={styles.discount}>{product.discountPercentage}% OFF</Text>
          ) : null}

          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.label}>Category: <Text style={styles.value}>{product.category}</Text></Text>
          <Text style={styles.label}>Brand: <Text style={styles.value}>{product.brand}</Text></Text>
          <Text style={styles.label}>SKU: <Text style={styles.value}>{product.sku}</Text></Text>
          <Text style={styles.label}>Stock: <Text style={styles.value}>{product.stock}</Text></Text>
          <Text style={styles.label}>Rating: <Text style={styles.value}>{product.rating}</Text></Text>
          <Text style={styles.label}>Availability: <Text style={styles.value}>{product.availabilityStatus}</Text></Text>

          <Text style={styles.label}>
            Weight: <Text style={styles.value}>{product.weight} g</Text>
          </Text>
          <Text style={styles.label}>
            Dimensions (W x H x D):{" "}
            <Text style={styles.value}>
              {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
            </Text>
          </Text>

          <Text style={styles.label}>Warranty: <Text style={styles.value}>{product.warrantyInformation}</Text></Text>
          <Text style={styles.label}>Shipping: <Text style={styles.value}>{product.shippingInformation}</Text></Text>
          <Text style={styles.label}>Return Policy: <Text style={styles.value}>{product.returnPolicy}</Text></Text>
          <Text style={styles.label}>Minimum Order Quantity: <Text style={styles.value}>{product.minimumOrderQuantity}</Text></Text>

    
          {product.meta?.qrCode ? (
            <Image source={{ uri: product.meta.qrCode }} style={styles.qrCode} />
          ) : null}

  
          <Text style={[styles.title, { marginTop: 20 }]}>Reviews</Text>
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review, idx) => (
              <View key={idx} style={styles.review}>
                <Text style={styles.reviewRating}>Rating: {review.rating}/5</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewAuthor}>- {review.reviewerName}</Text>
              </View>
            ))
          ) : (
            <Text>No reviews available.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
              <Image 
                  source={require('../../assets/addtocard.png')}
                  style={{
                    width:20,
                    height:20,
                    tintColor: '#fff',
                    // marginRight:2
                  }}
                  />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handlecart}>
              <Image 
                  source={require('../../assets/addtocard.png')}
                  style={{
                    width:20,
                    height:20,
                    tintColor: '#fff',
                    // marginRight:2
                  }}
                  />
          <Text style={styles.addText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  image: {
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  additionalImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 12,
  },

  infoContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  price: { fontSize: 20, fontWeight: "bold", color: "#28a745", marginTop: 6 },
  discount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: "#555",
    marginTop: 10,
    lineHeight: 22,
  },

  label: {
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  value: {
    fontWeight: "400",
    color: "#666",
  },

  qrCode: {
    width: 100,
    height: 100,
    marginTop: 16,
    alignSelf: "center",
  },

  review: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  reviewRating: {
    fontWeight: "bold",
  },
  reviewComment: {
    marginTop: 4,
    fontStyle: "italic",
  },
  reviewAuthor: {
    marginTop: 4,
    textAlign: "right",
    fontSize: 12,
    color: "#555",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-between",
    alignItems: "center",
  },

  cartButton: {
    backgroundColor: "#6c757d",
    padding: 14,
    borderRadius: 50,
  },

  addButton: {
    flexDirection: "row",
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    gap: 8,
  },

  addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
