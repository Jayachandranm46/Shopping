
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Linking,
  Image
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type SubscriptionData = {
  id: string;
  title: string;
  color: string;
  baseDiscount: number;
};

type SubscriptionSummary = {
  type: "random" | "weekend" | "weekdays";
  subscriptionData: SubscriptionData;
  selectedDays: string[];
  totalDiscount: number;
  daysCount: number;
};

type FinalSubscription = SubscriptionSummary & {
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
};

type RootStackParamList = {
  Calendar: { type: string; subscriptionData: SubscriptionData };
  MapPicker: { subscriptionSummary: SubscriptionSummary };
  ProductList: { subscription: FinalSubscription };
  SubscriptionOptions: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "MapPicker">;

interface LatLng {
  latitude: number;
  longitude: number;
}

const POPULAR_LOCATIONS = [
  { name: "Downtown", lat: 37.7749, lng: -122.4194, address: "Downtown San Francisco, CA" },
  { name: "Times Square", lat: 40.7580, lng: -73.9855, address: "Times Square, New York, NY" },
  { name: "Hollywood", lat: 34.0928, lng: -118.3287, address: "Hollywood, Los Angeles, CA" },
  { name: "Miami Beach", lat: 25.7617, lng: -80.1918, address: "Miami Beach, FL" },
  { name: "Chicago Loop", lat: 41.8781, lng: -87.6298, address: "Chicago Loop, IL" },
];

export default function MapPickerScreen({ route, navigation }: Props) {
  const { subscriptionSummary } = route.params;
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [locationMethod, setLocationMethod] = useState<"current" | "popular" | "manual" | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required', 
          'Please enable location permission to use current location',
          [
            { text: 'OK', onPress: () => setLoading(false) }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const locationCoords: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(locationCoords);
      setLocationMethod("current");
      await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location. Please try another method.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAddressFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const formattedAddress = [
          addr.name,
          addr.street,
          addr.city,
          addr.region,
          addr.country,
        ].filter(Boolean).join(', ');
        setLocationAddress(formattedAddress || 'Address not available');
      } else {
        setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  }, []);

  const handlePopularLocation = (location: typeof POPULAR_LOCATIONS[0]) => {
    setSelectedLocation({ latitude: location.lat, longitude: location.lng });
    setLocationAddress(location.address);
    setLocationMethod("popular");
  };

  const handleManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Invalid Input', 'Please enter valid numeric coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Invalid Range', 'Latitude must be between -90 and 90, Longitude between -180 and 180');
      return;
    }

    setSelectedLocation({ latitude: lat, longitude: lng });
    setLocationMethod("manual");
    getAddressFromCoordinates(lat, lng);
  };

  const openInMaps = () => {
    if (selectedLocation) {
      const url = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleConfirmLocation = useCallback(() => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please select a delivery location using one of the methods above');
      return;
    }

    const finalSubscription: FinalSubscription = {
      ...subscriptionSummary,
      deliveryLocation: {
        ...selectedLocation,
        address: locationAddress,
        timestamp: new Date().toISOString(),
      }
    };

    Alert.alert(
      '🎉 Subscription Confirmed!',
      `Plan: ${subscriptionSummary.subscriptionData.title}\nDays: ${subscriptionSummary.daysCount} delivery days\nDiscount: ${subscriptionSummary.totalDiscount}% OFF\n\nDelivery Location:\n${locationAddress}`,
      [
        {
          text: 'Complete Setup',
          onPress: () => {
            navigation.navigate('ProductList', { subscription: finalSubscription });
          }
        }
      ]
    );
  }, [selectedLocation, subscriptionSummary, locationAddress, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

   
      <View style={[styles.summaryBar, { backgroundColor: subscriptionSummary.subscriptionData.color }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Days</Text>
          <Text style={styles.summaryValue}>{subscriptionSummary.daysCount}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.summaryValue}>{subscriptionSummary.totalDiscount}%</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Plan</Text>
          <Text style={styles.summaryValue}>{subscriptionSummary.type.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Current Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Use Current Location</Text>
          <TouchableOpacity
            style={[styles.locationButton, { borderColor: subscriptionSummary.subscriptionData.color }]}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={subscriptionSummary.subscriptionData.color} />
            ) : (
              <Ionicons name="locate" size={24} color={subscriptionSummary.subscriptionData.color} />
            )}
            <Text style={[styles.buttonText, { color: subscriptionSummary.subscriptionData.color }]}>
              {loading ? "Getting Location..." : "Get My Current Location"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏙️ Popular Locations</Text>
          <View style={styles.popularGrid}>
            {POPULAR_LOCATIONS.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.popularButton,
                  selectedLocation?.latitude === location.lat && 
                  selectedLocation?.longitude === location.lng && 
                  styles.selectedPopular
                ]}
                onPress={() => handlePopularLocation(location)}
              >
                <Text style={styles.popularName}>{location.name}</Text>
                <Text style={styles.popularAddress}>{location.address}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

     
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Enter Coordinates Manually</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Latitude</Text>
              <TextInput
                style={styles.textInput}
                placeholder="37.7749"
                value={manualLat}
                onChangeText={setManualLat}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Longitude</Text>
              <TextInput
                style={styles.textInput}
                placeholder="-122.4194"
                value={manualLng}
                onChangeText={setManualLng}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.manualButton, { backgroundColor: subscriptionSummary.subscriptionData.color }]}
            onPress={handleManualLocation}
            disabled={!manualLat || !manualLng}
          >
            <Text style={styles.manualButtonText}>Set Location</Text>
          </TouchableOpacity>
        </View>

    
        {selectedLocation && (
          <View style={[styles.selectedLocationCard, { borderColor: subscriptionSummary.subscriptionData.color }]}>
            <View style={styles.selectedHeader}>
              <Ionicons name="checkmark-circle" size={24} color={subscriptionSummary.subscriptionData.color} />
              <Text style={[styles.selectedTitle, { color: subscriptionSummary.subscriptionData.color }]}>
                Location Selected
              </Text>
            </View>
            <Text style={styles.selectedAddress}>{locationAddress}</Text>
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinates}>
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewMapButton} onPress={openInMaps}>
              <Ionicons name="map" size={16} color="#007AFF" />
              <Text style={styles.viewMapText}>View in Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

   
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={20} color="#3498db" />
          <Text style={styles.instructionsText}>
            Choose one of the methods above to set your delivery location. You can use your current location, select from popular cities, or enter coordinates manually.
          </Text>
        </View>

      </ScrollView>

    
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: subscriptionSummary.subscriptionData.color },
            !selectedLocation && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.confirmButtonText}>Confirm Subscription & Location</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.goBack()}
          >
          
            <Image
              source={require('../../assets/calender.jpg')}
              style={{
                width: 20,
                height: 20,
               
                // marginRight:2
              }}
            />
            <Text style={styles.quickActionText}>Change Dates</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('SubscriptionOptions')}
          >
             <Image
              source={require('../../assets/leftarrow.png')}
              style={{
                width: 20,
                height: 20,
               
                // marginRight:2
              }}
            />
            <Text style={styles.quickActionText}>Change Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderWidth: 2,
    borderRadius: 10,
    borderStyle: "dashed",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  popularGrid: {
    gap: 8,
  },
  popularButton: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  selectedPopular: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
  popularName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  popularAddress: {
    fontSize: 13,
    color: "#7f8c8d",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  manualButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  manualButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedLocationCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  selectedAddress: {
    fontSize: 15,
    color: "#34495e",
    lineHeight: 20,
    marginBottom: 8,
  },
  coordinatesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  coordinates: {
    fontSize: 12,
    color: "#7f8c8d",
    fontFamily: "monospace",
    textAlign: "center",
  },
  viewMapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  viewMapText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  instructionsCard: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  bottomContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#bdc3c7",
    elevation: 0,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingHorizontal: 20,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
});