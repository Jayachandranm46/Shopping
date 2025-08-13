// src/screens/CartScreen.tsx
import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { CartContext } from "../store/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "../utils/common";

export default function CartScreen({ navigation }: any) {
  const { cartItems, removeFromCart, totalPrice } = useContext(CartContext);


  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item?.thumbnail }} style={styles.image} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item.id)}
                >
                  {/* <Ionicons name="trash-outline" size={22} color="#fff" /> */}
                      <Image 
                          source={require('../../assets/delete.png')}
                          style={{
                            width:20,
                            height:20,
                            tintColor: '#fff',
                            // margi`nRight:2
                          }}
                          />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Footer Total and Button */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(totalPrice())}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate("SubscriptionOptions")}
            >
              <Text style={styles.checkoutText}>Proceed</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { fontSize: 18, color: "#888", marginTop: 10 },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: { width: 60, height: 60, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#222" },
  price: { fontSize: 14, color: "#28a745", marginTop: 4 },
  removeBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 8,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "100%",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalLabel: { fontSize: 14, color: "#888" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#222" },
  checkoutBtn: {
    backgroundColor: "#28a745",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 6,
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
