import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Expo vector icons import

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

import ProductListScreen from "../screens/ProductListScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import CartScreen from "../screens/CartScreen";
import SubscriptionOptionsScreen from "../screens/SubscriptionOptionsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import MapPickerScreen from "../screens/MapPickerScreen";
import OrderConfirmationScreen from "../screens/OrderConfirmationScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator initialRouteName="ProductList">
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={({ navigation }) => ({
          title: "Products",
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("Cart")}
            >
              <Ionicons name="cart-outline" size={24} color="gray" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Details" }} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="SubscriptionOptions" component={SubscriptionOptionsScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
    </Stack.Navigator>
  );
}
