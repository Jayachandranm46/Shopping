import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainStack from "./MainStack";
import { CartProvider } from "../store/CartContext";


export default function AppNavigator() {
  return (
    <CartProvider>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </CartProvider>
  );
}
