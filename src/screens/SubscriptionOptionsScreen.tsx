// src/screens/SubscriptionOptionsScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface SubscriptionOption {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  baseDiscount: number;
  days: string[];
}

export default function SubscriptionOptionsScreen({ navigation }: any) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options: SubscriptionOption[] = [
    {
      id: "weekend",
      title: "Weekend Subscription",
      desc: "Saturday & Sunday deliveries only",
      icon: "calendar-outline",
      color: "#f39c12",
      baseDiscount: 10,
      days: ["Saturday", "Sunday"],
    },
    {
      id: "weekdays",
      title: "Weekdays Subscription", 
      desc: "Monday to Friday deliveries only",
      icon: "briefcase-outline",
      color: "#27ae60",
      baseDiscount: 15,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    {
      id: "random",
      title: "Random Days Subscription",
      desc: "Choose any days you prefer",
      icon: "shuffle-outline",
      color: "#2980b9",
      baseDiscount: 5,
      days: ["Flexible scheduling"],
    },
  ];

  const handleSelect = (option: SubscriptionOption) => {
    setSelectedOption(option.id);
    navigation.navigate("Calendar", { 
      type: option.id,
      subscriptionData: option
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Subscription Plan</Text>
        <Text style={styles.subtitle}>
          Select the delivery schedule that works best for you
        </Text>
      </View>

      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.card, 
            { borderLeftColor: option.color },
            selectedOption === option.id && styles.selectedCard
          ]}
          onPress={() => handleSelect(option)}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={option.icon as any}
                size={40}
                color={option.color}
              />
            </View>
            
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <View style={[styles.discountBadge, { backgroundColor: option.color }]}>
                  <Text style={styles.discountText}>{option.baseDiscount}% OFF</Text>
                </View>
              </View>
              
              <Text style={styles.cardDesc}>{option.desc}</Text>
              
              <View style={styles.daysContainer}>
                {option.days.map((day, index) => (
                  <View key={index} style={[styles.dayTag, { borderColor: option.color }]}>
                    <Text style={[styles.dayText, { color: option.color }]}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                  <Text style={styles.benefitText}>Free delivery</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                  <Text style={styles.benefitText}>Priority support</Text>
                </View>
              </View>
            </View>

            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={selectedOption === option.id ? option.color : "#999"} 
            />
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.footer}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Additional Discounts Available</Text>
            <Text style={styles.infoDesc}>
              • 5+ days selected: Extra 10% discount{'\n'}
              • 10+ days selected: Extra 15% discount{'\n'}
              • Multiple items: Up to 20% total discount
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderLeftWidth: 6,
    overflow: "hidden",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#3498db",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    flex: 1,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDesc: {
    fontSize: 15,
    color: "#7f8c8d",
    marginBottom: 12,
    lineHeight: 20,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dayTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  benefit: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  benefitText: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 4,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
});