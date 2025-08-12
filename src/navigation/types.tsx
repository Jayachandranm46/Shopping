export type RootStackParamList = {
  ProductList: undefined;
  ProductDetails: { productId: number };
  Cart: undefined;
  SubscriptionOptions: undefined;
  Calendar: { subscriptionType: string };
  MapPicker: { subscriptionDetails: any };
  OrderConfirmation: { orderId: string };
};
