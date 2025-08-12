import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
export const handleAddToCart = async (product: any) => {
    console.log('product',product);
    
    try {

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Added to Cart 🛒",
                body: `${product.title} has been added to your cart.`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
        });
        Alert.alert("Added to Cart", `${product.title} has been added!`);
    } catch (error) {
        console.error("Error adding to cart or sending notification:", error);
        Alert.alert("Error", "Could not add product to cart.");
    }
};
