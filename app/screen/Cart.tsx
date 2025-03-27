import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { fetchCartItems } from "../(tabs)/api/db";
import { removeFromCart } from "../(tabs)/api/db";
import { removeFromOrder } from "../(tabs)/api/db";
import { addOrder } from "../(tabs)/api/db";
import { supabase } from '../lib/supabase';
import { useAuth } from "./AuthContext"
import { Float } from "react-native/Libraries/Types/CodegenTypes";

// Define the CartItem interface
interface CartItem {
  id: number;
  name: string;
  description: string;
  price: string | number;
  image: any;
}

export default function Cart() {
  // State for cart data from API
  const [cartData, setCartData] = useState<CartItem[]>([]);
  // State for items that have been ordered
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  let userId: string | null;
  async function getUser() {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  }
  getUser();
  // Total price of ordered items
  const [totalPrice, setTotalPrice] = useState<number>(0);
  // Track if checkout is complete
  const [isCheckoutComplete, setIsCheckoutComplete] = useState<boolean>(false);

  useEffect(() => {
    fetchCartItems().then((data) => { 
      setCartData(data.data || []);
    });
  }, []);
  
 // Removed unnecessary useEffect block as removeFromCart requires an itemId argument.

  // Function to extract price as a number from various formats
  const extractPrice = (price: string | number): number => {
    if (typeof price === 'number') {
      return price;
    }
    
    // Handle string price
    if (typeof price === 'string') {
      // Remove any currency symbols and non-numeric characters except decimal point
      const numericString = price.replace(/[^0-9.]/g, '');
      return parseFloat(numericString) || 0;
    }
    
    return 0;
  };

  // Function to order an item (remove from cart and add to ordered items)
  const orderItem = (item: CartItem): void => {
    // Remove from cart data
    setCartData((prevData) => prevData.filter((cartItem) => cartItem.id !== item.id));


    addOrder(item, userId || "").then(() => {
      console.log("Order added to database");
    }
    );
    
    // Add to ordered items
    setOrderedItems((prevItems) => [...prevItems, item]);
    
    // Update total price
    const itemPrice = extractPrice(item.price);
    setTotalPrice((prevTotal) => prevTotal + itemPrice);
  };

  // Function to remove an item from the cart
  const deleteFromCart = (itemId: number): void => {
    removeFromCart(itemId);
    setCartData((prevData) => prevData.filter((item) => item.id !== itemId));
  };

  // Function to remove an item from ordered items
  const deleteFromOrder = (itemId: number): void => {
        removeFromOrder(itemId);
    // Find the item to get its price
    const itemToRemove = orderedItems.find(item => item.id === itemId);
    
    if (itemToRemove) {
      // Update total price by subtracting the item's price
      const itemPrice = extractPrice(itemToRemove.price);
      setTotalPrice((prevTotal) => prevTotal - itemPrice);
      
      // Remove from ordered items
      setOrderedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }
  };

  // Handle checkout process
  const handleCheckout = () => {
    console.log("Checkout button pressed");
    if (orderedItems.length === 0) {
      console.log("No items in order");
      Alert.alert("Error", "You need to order items before checkout.");
      return;
    }
    
    console.log("Showing confirmation dialog directly...");
    
    // Try showing alert directly without setTimeout
    Alert.alert(
      "Confirm Checkout",
      `Complete your purchase for Ksh ${totalPrice.toFixed(2)}?`,
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log("Checkout cancelled")
        },
        {
          text: "Confirm",
          onPress: () => {
            console.log("Confirm pressed");
            setIsCheckoutComplete(true);
            console.log("isCheckoutComplete set to true");
            
            // Use a separate function for success alert
            const showSuccessAlert = () => {
              console.log("Showing success alert");
              Alert.alert(
                "Success", 
                "Your order has been placed successfully!"
              );
              router.push("/");
            };
            
            // Call after a delay
            setTimeout(showSuccessAlert, 500);
          },
        },
      ]
    );
    
    console.log("After Alert.alert call");
  };

  // Format price for display
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return `Ksh${price.toFixed(2)}`;
    }
    return typeof price === 'string' ? price : `Ksh0.00`;
  };
  

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <TouchableOpacity style={styles.brandyCard}>
      <Image 
          source={
            typeof item.image === "string" 
              ? (
                item.image.includes('res.cloudinary.com') || 
                item.image.startsWith('https://') || 
                item.image.startsWith('http://')
                ? { uri: item.image }
                : item.image
              )
              : item.image
          } 
          style={styles.brandyImage}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
       <View style={styles.brandyInfo}>
        <Text style={styles.brandyName}>{item.name}</Text>
        <Text style={styles.brandyDescription}>{item.description}</Text>
        <Text style={styles.brandyPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.cartButton}>
          <TouchableOpacity style={styles.addButton} onPress={() => orderItem(item)}>
            <Text style={styles.addButtonText}>Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteFromCart(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderedItem = ({ item }: { item: CartItem }) => (
    <View style={styles.orderedItem}>
      <View style={styles.orderedItemContent}>
        <Text style={styles.orderedItemText}>
          {item.name} - {formatPrice(item.price)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeOrderedButton}
      >
        <Icon name="times" size={16} color="#fff"  onPress={() => deleteFromOrder(item.id)}/>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>Your Cart</Text>
        <Icon name="shopping-cart" size={22} color="#fff" />
      </View>

      {/* Ordered Items Section */}
      <View style={styles.orderedSection}>
        <Text style={styles.sectionTitle}>Your Orders</Text>
        {orderedItems.length > 0 ? (
          <>
            <FlatList
              data={orderedItems}
              keyExtractor={(item, index) => `ordered-${item.id}-${index}`}
              renderItem={renderOrderedItem}
              style={styles.orderedList}
              scrollEnabled={orderedItems.length > 3}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: Ksh{totalPrice.toFixed(2)}</Text>
              <TouchableOpacity 
                style={[
                  styles.checkoutButton,
                  isCheckoutComplete && styles.checkoutComplete
                ]}
                onPress={handleCheckout}
                disabled={isCheckoutComplete}
              >
                <Text style={styles.checkoutButtonText}>
                  {isCheckoutComplete ? "Order Placed" : "Checkout"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.emptyCartText}>You haven't ordered anything yet.</Text>
        )}
      </View>

      {/* Cart Items */}
      <View style={styles.cartItemsSection}>
        <Text style={styles.sectionTitle}>Cart Items</Text>
        {cartData.length > 0 ? (
          <FlatList
            data={cartData}
            // keyExtractor={(item) => item.id}
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  orderedSection: {
    backgroundColor: "#1e1e1e", 
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  orderedList: {
    maxHeight: 200,
  },
  orderedItem: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderedItemContent: {
    flex: 1,
  },
  orderedItemText: {
    color: "#fff",
    fontSize: 14,
  },
  removeOrderedButton: {
    backgroundColor: "#f44336",
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    height: 25,
    width: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: "#444",
    paddingTop: 10,
    marginTop: 5,
  },
  totalText: {
    color: "#4caf50",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#3f51b5",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  checkoutComplete: {
    backgroundColor: "#4caf50",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cartItemsSection: {
    flex: 1,
  },
  brandyCard: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
  },
  brandyImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  brandyInfo: {
    flex: 1,
  },
  brandyName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  brandyDescription: {
    color: "#bbb",
    fontSize: 14,
    marginVertical: 5,
  },
  brandyPrice: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cartButton: {
    flexDirection: "row",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#4caf50",
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#f44336",
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyCartText: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 10,
  },
});