import { Link, router, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import image1 from "../(tabs)/src/images/wines.jpg";
import image2 from "../(tabs)/src/images/Brandy.jpg";
import image3 from "../(tabs)/src/images/Vodka.jpg";  
import image4 from "../(tabs)/src/images/Beers.jpg";
import image5 from "../(tabs)/src/images/Rum.jpg";
import image7 from "../(tabs)/src/images/Gin.jpg";
import image8 from "../(tabs)/src/images/Tequila.jpg";
import image9 from "../(tabs)/src/images/spirits23.jpg";
import image10 from "../(tabs)/src/images/Tequila23.jpg";
import pop1 from "../(tabs)/src/images/popular1.jpg";
import pop2 from "../(tabs)/src/images/popular2.jpg";
import pop3 from "../(tabs)/src/images/popular3.jpg";
import pop4 from "../(tabs)/src/images/popular4.jpg";
import pop5 from "../(tabs)/src/images/popular5.jpg";
import pop6 from "../(tabs)/src/images/popular6.jpg";
import { useAuth } from "../screen/AuthContext"; // Import the AuthContext
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { fetchProducts } from "./api/db";

// import { useCart } from "./src/CartContext"; // Import the CartContext

export default function HomeScreen() {

  useFocusEffect(
    React.useCallback(() => {
      checkSession();
    }, [])
  );

  // Function to check if a session already exists
  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // User is not logged in, redirect to home
      router.push("/Login");
    }
  }

  const categories = [
    { id: "1", name: "Whiskey", icon: "glass", link:"../screen/Whiskey", image: image1 },
    { id: "2", name: "Brandy", icon: "beer", link: "../screen/Brandy", image: image2 },
    { id: "3", name: "Vodka", icon: "glass", link: "../screen/Vodka", image: image3  },
    { id: "4", name: "Beer", icon: "beer", link: "../screen/Beer", image: image4 },
    { id: "5", name: "Rum", icon: "glass", link: "../screen/Rum",image: image5 },
    { id: "6", name: "Wines", icon: "beer", link: "../screen/Wines", image: image7 },
    { id: "7", name: "Gin", icon: "glass", link: "../screen/Gin",image: image8 },
    { id: "8", name: "Tequila", icon: "beer", link: "../screen/Tequila",image: image10},
    { id: "9", name: "Spirits", icon: "glass", link: "../screen/Spirits",image: image9 },
  ];

  const popularBrands = [
    {
      id: "1",
      name: "The Glenlivet",
      price: "Ksh.999.00",
      quantity: "10",
      image: pop1,
    },
    {
      id: "2",
      name: "Carlsberg",
      price: "Ksh.949.00",
      quantity: "10",
      image: pop2,
    },
    {
      id: "3",
      name: "Belvedere",
      price: "Ksh.999.00",
      quantity: "10",
      image: pop3,
    },
    {
      id: "4",
      name: "Guinness",
      price: "Ksh.949.00",
      quantity: "10",
      image: pop4,
    },
    {
      id: "5",
      name: "Black Tot",
      price: "Ksh.999.00",
      image: pop5,
    },
    {
      id: "6",
      name: "Peperoni",
      price: "Ksh.949.00",
      quantity: "10",
      image: pop6,
    },
  ];

   async function handleLogout() {
      try {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('supabase_session');
        await AsyncStorage.removeItem('user_data');
        router.push("/Login");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  
  // function addToCart(item: { id: string; name: string; price: string; quantity?: string; image: string }): void {
  //   // Retrieve the current cart from AsyncStorage
  //   AsyncStorage.getItem('cart')
  //     .then((cart) => {
  //       const cartItems = cart ? JSON.parse(cart) : [];
  //       const existingItemIndex = cartItems.findIndex((cartItem: any) => cartItem.id === item.id);

  //       if (existingItemIndex !== -1) {
  //         // If the item already exists in the cart, update its quantity
  //         cartItems[existingItemIndex].quantity = (parseInt(cartItems[existingItemIndex].quantity || '1') + 1).toString();
  //       } else {
  //         // If the item is not in the cart, add it with a quantity of 1
  //         cartItems.push({ ...item, quantity: '1' });
  //       }

  //       // Save the updated cart back to AsyncStorage
  //       AsyncStorage.setItem('cart', JSON.stringify(cartItems))
  //         .then(() => {
  //           console.log('Item added to cart:', item.name);
  //         })
  //         .catch((error) => {
  //           console.error('Error saving cart:', error);
  //         });
  //     })
  //     .catch((error) => {
  //       console.error('Error retrieving cart:', error);
  //     });
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>TA Liquor Store</Text>
        <Link href="./screen/Cart">
        <Icon name="shopping-cart" size={22} color="#fff" /></Link>
        <Icon2 name="logout" size={22} color="#fff" onPress={()=> {handleLogout()}}/>
      </View>
      
      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Your Brand"
          placeholderTextColor="#bbb"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View> */}

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryItem} onPress={() => {}}>
            <Link href={item.link as any}>
              <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.categoryImage} />
            </Link>
            <Link href={item.link as any}>
              <Text style={styles.categoryText}>{item.name}</Text> 
            </Link>
            
          </TouchableOpacity>
        )}
      />

      {/* Popular Brands */}
      <Text style={styles.sectionTitle}>Popular Brands</Text>
      <FlatList
        data={popularBrands}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.brandCard}>
            <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.brandImage} />
            <Text style={styles.brandName}>{item.name}</Text>
            <Text style={styles.brandPrice}>{item.price}</Text>
            {/* <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)} // Add item to cart
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity> */}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fcf803",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    color: "#fff",
  },
  searchButton: {
    padding: 10,
    backgroundColor: "#FFD700",
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  categoryItem: {
    alignItems: "center",
    backgroundColor: "#222",
    padding: 3,
    borderRadius: 10,
    marginRight: 10,
    height: 200,
    width: 150,
    flexDirection: "column",
  },
  categoryText: {
    color: "#FFD700",
    // marginTop: 7,
    margin: "auto",
    
  },
  addButton: {
    backgroundColor: "#FFD700",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#121212",
    fontWeight: "bold",
  },
  categoryImage: {
    width: 160,
    height: 165,
    borderRadius: 10,
    zIndex: -1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,

  },
  brandCard: {
    backgroundColor: "#222",
    padding: 3,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 15,
    height: 255,
    
    
  },
  brandImage: {
    width: 160,
    height: 165,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  brandText: {
    height: 100,
  },
  brandName: {
    color: "#fff",
    marginTop: 5,
    fontWeight: "bold",
  },
  brandPrice: {
    color: "#FFD700",
    marginTop: 5,
  },
});