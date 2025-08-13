
import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Alert,
  Image
} from "react-native";
import { Calendar, DateData, MarkedDates } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type SubscriptionData = {
  id: string;
  title: string;
  color: string;
  baseDiscount: number;
};

type RootStackParamList = {
  Calendar: {
    type: "random" | "weekend" | "weekdays";
    subscriptionData: SubscriptionData;
  };
  MapPicker: { subscriptionSummary: SubscriptionSummary };
  ProductList: { subscription: FinalSubscription };
  SubscriptionOptions: undefined;
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

type Props = NativeStackScreenProps<RootStackParamList, "Calendar">;

const { width } = Dimensions.get("window");

export default function CalendarScreen({ route, navigation }: Props) {
  const { type, subscriptionData } = route.params;
  
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [totalDiscount, setTotalDiscount] = useState(subscriptionData.baseDiscount);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});


  const BONUS_DISCOUNTS = [
    { minDays: 10, bonus: 15 },
    { minDays: 5, bonus: 10 },
  ];
  const MAX_DISCOUNT = 20;


  const getCalendarRange = useCallback(() => {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    return {
      minDate: today.toISOString().split("T")[0],
      maxDate: threeMonthsLater.toISOString().split("T")[0],
    };
  }, []);


  useEffect(() => {
    if (type === "random") {
      setSelectedDays(new Set());
      setMarkedDates({});
      return;
    }

    const today = new Date();
    const daysSet = new Set<string>();
    const marks: MarkedDates = {};

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split("T")[0];

      let includeDay = false;
      if (type === "weekend" && (dayOfWeek === 0 || dayOfWeek === 6)) {
        includeDay = true;
      } else if (type === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) {
        includeDay = true;
      }

      if (includeDay) {
        daysSet.add(dateStr);
        marks[dateStr] = {
          selected: true,
          selectedColor: subscriptionData.color,
          selectedTextColor: "#fff",
        };
      }
    }
    setSelectedDays(daysSet);
    setMarkedDates(marks);
  }, [type, subscriptionData.color]);


  const handleDayPress = useCallback((day: DateData) => {
    if (type !== "random") {
      Alert.alert(
        "Fixed Schedule",
        `${subscriptionData.title} has a fixed schedule. Switch to Random Days subscription to customize dates.`,
        [
          { text: "OK" },
          { text: "Switch Plan", onPress: () => navigation.goBack() },
        ]
      );
      return;
    }

    const dateStr = day.dateString;
    const newSelectedDays = new Set(selectedDays);

    if (newSelectedDays.has(dateStr)) {
      newSelectedDays.delete(dateStr);
    } else {
      const todayStr = new Date().toISOString().split("T")[0];
      if (dateStr < todayStr) {
        Alert.alert("Invalid Date", "Cannot select past dates.");
        return;
      }
      newSelectedDays.add(dateStr);
    }

    const newMarkedDates: MarkedDates = {};
    newSelectedDays.forEach(d => {
      newMarkedDates[d] = {
        selected: true,
        selectedColor: subscriptionData.color,
        selectedTextColor: "#fff",
      };
    });

    setSelectedDays(newSelectedDays);
    setMarkedDates(newMarkedDates);
  }, [selectedDays, subscriptionData.color, type, navigation]);


  useEffect(() => {
    const count = selectedDays.size;
    let bonus = 0;

    for (const tier of BONUS_DISCOUNTS) {
      if (count >= tier.minDays) {
        bonus = tier.bonus;
        break; 
      }
    }

    const total = Math.min(subscriptionData.baseDiscount + bonus, MAX_DISCOUNT);
    setTotalDiscount(total);
  }, [selectedDays, subscriptionData.baseDiscount]);


  const handleConfirmAndProceed = useCallback(() => {
    if (selectedDays.size === 0) {
      Alert.alert("No Days Selected", "Please select at least one delivery day.");
      return;
    }

    const subscriptionSummary: SubscriptionSummary = {
      type,
      subscriptionData,
      selectedDays: Array.from(selectedDays).sort(),
      totalDiscount,
      daysCount: selectedDays.size,
    };

    navigation.navigate("MapPicker", { subscriptionSummary });
  }, [selectedDays, subscriptionData, totalDiscount, navigation, type]);

  const getDiscountColor = () => {
    if (totalDiscount >= 20) return "#e74c3c";
    if (totalDiscount >= 15) return "#f39c12";
    if (totalDiscount >= 10) return "#27ae60";
    return "#95a5a6";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.instructionCard}>
        <Ionicons 
          name={type === "random" ? "hand-left" : "information-circle"} 
          size={20} 
          color="#3498db" 
        />
        <Text style={styles.instructionText}>
          {type === "random" 
            ? "Tap on dates to add or remove delivery days"
            : `${subscriptionData.title} - Pre-selected based on your plan`
          }
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          {...getCalendarRange()}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#2c3e50",
            selectedDayBackgroundColor: subscriptionData.color,
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#e74c3c",
            dayTextColor: "#2c3e50",
            textDisabledColor: "#bdc3c7",
            arrowColor: subscriptionData.color,
            monthTextColor: "#2c3e50",
            indicatorColor: subscriptionData.color,
            textDayFontFamily: "System",
            textMonthFontFamily: "System",
            textDayHeaderFontFamily: "System",
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
          disableAllTouchEventsForDisabledDays={true}
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          {/* <Ionicons name="calendar" size={24} color={subscriptionData.color} /> */}
            <Image
                        source={require('../../assets/calender.jpg')}
                        style={{
                          width: 20,
                          height: 20,
                      //  tintColor:'#fff'
                        }}
                      />
          <Text style={styles.summaryTitle}>Subscription Summary</Text>
        </View>

        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan:</Text>
            <Text style={styles.summaryValue}>{subscriptionData.title}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Days:</Text>
            <Text style={styles.summaryValue}>{selectedDays.size} day{selectedDays.size !== 1 ? 's' : ''}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base Discount:</Text>
            <Text style={styles.summaryValue}>{subscriptionData.baseDiscount}%</Text>
          </View>
          
          {totalDiscount > subscriptionData.baseDiscount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bonus Discount:</Text>
              <Text style={[styles.summaryValue, { color: "#27ae60" }]}>
                +{totalDiscount - subscriptionData.baseDiscount}%
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Discount:</Text>
            <Text style={[styles.totalValue, { color: getDiscountColor() }]}>
              {totalDiscount}% OFF
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: subscriptionData.color }]}
          onPress={handleConfirmAndProceed}
          activeOpacity={0.8}
          accessibilityLabel="Confirm and select delivery location"
          accessibilityRole="button"
        >
          <Ionicons name="location" size={22} color="#fff" />
          <Text style={styles.buttonText}>Confirm & Select Location</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 8,
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  calendar: {
    borderRadius: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 8,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: { 
    fontSize: 16, 
    color: "#7f8c8d" 
  },
  summaryValue: { 
    fontSize: 16, 
    fontWeight: "500",
    color: "#2c3e50" 
  },
  divider: {
    height: 1,
    backgroundColor: "#ecf0f1",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
  },
});
