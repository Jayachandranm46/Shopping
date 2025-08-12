import React, { useEffect, useRef, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { CartProvider } from "./src/store/CartContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { createProductsTable } from "./src/database/sqliteService";

// Keep splash screen visible while we prepare the app
SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize database
        await createProductsTable();
        
        // Set up notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });
        
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <CartProvider>
      <AppNavigator />
    </CartProvider>
  );
}