// src/screens/MapPickerScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

interface MapPickerScreenProps {
  route: {
    params: {
      subscriptionSummary: {
        type: string;
        subscriptionData: any;
        selectedDays: string[];
        totalDiscount: number;
        daysCount: number;
      };
    };
  };
  navigation: any;
}

export default function MapPickerScreen({ route, navigation }: MapPickerScreenProps) {
  const { subscriptionSummary } = route.params;
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required', 
          'Please enable location permission to select delivery address',
          [
            { text: 'Skip', onPress: () => {
              setLoading(false);
              setMapReady(true);
            }},
            { text: 'Enable', onPress: () => getCurrentLocation() }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      const locationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setRegion(newRegion);
      setCurrentLocation(locationCoords);
      setSelectedLocation(locationCoords);


      await getAddressFromCoordinates(location.coords.latitude, location.coords.longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get current location. Please select manually on the map.');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const formattedAddress = [
          addr.name,
          addr.street,
          addr.city,
          addr.region,
        ].filter(Boolean).join(', ');
        setLocationAddress(formattedAddress || 'Address not available');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const handleMapPress = async (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    console.log('Map pressed at:', coordinate); 
    setSelectedLocation(coordinate);
    await getAddressFromCoordinates(coordinate.latitude, coordinate.longitude);
  };

  const onMapReady = () => {
    console.log('Map is ready'); 
    setMapReady(true);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('No Location Selected', 'Please tap on the map to select a delivery location');
      return;
    }

    const finalSubscription = {
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
  };

  const moveToCurrentLocation = () => {
    if (currentLocation) {
      const newRegion = {
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setSelectedLocation(currentLocation);
      getAddressFromCoordinates(currentLocation.latitude, currentLocation.longitude);
    } else {
      getCurrentLocation();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={subscriptionSummary.subscriptionData.color} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </SafeAreaView>
    );
  }

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


      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          onMapReady={onMapReady}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          mapType="standard"
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
        
          {selectedLocation && mapReady && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Delivery Location"
              description={locationAddress}
            >
         
              <View style={styles.markerContainer}>
                <View style={[styles.markerPin, { backgroundColor: subscriptionSummary.subscriptionData.color }]}>
                  <Ionicons name="location" size={20} color="#fff" />
                </View>
                <View style={[styles.markerShadow, { borderTopColor: subscriptionSummary.subscriptionData.color }]} />
              </View>
            </Marker>
          )}
        </MapView>
        

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={moveToCurrentLocation}
        >
          <Ionicons name="locate" size={24} color={subscriptionSummary.subscriptionData.color} />
        </TouchableOpacity>

  
        {!mapReady && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={styles.mapLoadingText}>Loading map...</Text>
          </View>
        )}
      </View>


      {selectedLocation && (
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location-outline" size={20} color={subscriptionSummary.subscriptionData.color} />
            <Text style={styles.locationTitle}>Selected Location</Text>
          </View>
          <Text style={styles.locationAddress}>{locationAddress}</Text>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinates}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}

 
      <View style={styles.instructionsCard}>
        <Ionicons name="information-circle" size={20} color="#3498db" />
        <Text style={styles.instructionsText}>
          Tap anywhere on the map to set your delivery location
        </Text>
      </View>

   
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
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.quickActionText}>Change Dates</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('SubscriptionOptions')}
          >
            <Ionicons name="swap-horizontal" size={16} color="#666" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
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
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  markerShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  currentLocationButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 16,
    borderRadius: 8,
  },
  mapLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  locationCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 8,
  },
  locationAddress: {
    fontSize: 15,
    color: "#34495e",
    lineHeight: 20,
    marginBottom: 8,
  },
  coordinatesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
  },
  coordinates: {
    fontSize: 12,
    color: "#7f8c8d",
    fontFamily: "monospace",
    textAlign: "center",
  },
  instructionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 8,
    flex: 1,
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