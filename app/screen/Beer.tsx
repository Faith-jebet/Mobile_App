import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { addProductToCart, fetchProducts } from "../(tabs)/api/db";
import Icon from "react-native-vector-icons/FontAwesome";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export default function Beer() {
  // beer types data with descriptions and images
  const [beerTypes, setBeerTypes] = useState<BeerType[]>([]);
  const [loading, setLoading] = useState(true);

  interface BeerType {
    id: string;
    name: string;
    description: string;
    price: Float;
    image: any;
    popular: boolean;
  }

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        if (result.success) {
          const beers = result.data?.filter(item => 
            item.categoryType.toLowerCase().includes("beer")
          ) ?? [];
          setBeerTypes(beers);
        } else {
          console.error("Error fetching products:", result.error);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);


  interface CartItem {
    id: number;
    name: string;
    description: string;
    price: Float;
    image: any;
  }

  const addCart = (num: string): void => {
    beerTypes.map((item: BeerType) => {
      if (item.id === num) {
        const cartItem: CartItem = {
          id: parseInt(item.id), // Ensure id is a number
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
        };
        addProductToCart(cartItem);
      }
    });
  };

  // Filter popular beer types
  // const popularBeer = beerTypes.filter(item => item.popular);

  const renderBeerItem = ({ item }: { item: { id: string; name: string; description: string; price: Float; image: string; popular: boolean; } }) => (
    <TouchableOpacity style={styles.beerCard}>
      <Image source = {typeof item.image === 'string' ? {uri: item.image}: item.image} style={styles.beerImage} />
      <View style={styles.beerInfo}>
        <Text style={styles.beerName}>{item.name}</Text>
        <Text style={styles.beerDescription}>{item.description}</Text>
        <Text style={styles.beerPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => addCart(item.id)}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Beer Collection</Text>
        <Link href="../screen/Cart">
        <Icon name="shopping-cart" size={22} color="#fff" />
        </Link>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        {/* <Image source = {typeof item.image === 'string' ? {uri: item.image} : item.image} /> */}
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Beer</Text>
          <Text style={styles.bannerText}>Discover our premium selection of beers from around the world</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Beer Types</Text>
      {/* Main list of all beer types */}
      <FlatList
        data={beerTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderBeerItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  banner: {
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
  },
  bannerTitle: {
    color: "#FFD700",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bannerText: {
    color: "#fff",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop: 10,
  },
  popularCard: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
    width: 120,
    alignItems: "center",
  },
  popularImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  popularName: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  popularPrice: {
    color: "#FFD700",
    marginTop: 3,
  },
  listContainer: {
    paddingBottom: 20,
  },
  beerCard: {
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
  },
  beerImage: {
    width: 100,
    height: 150,
  },
  beerInfo: {
    flex: 1,
    padding: 12,
  },
  beerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  beerDescription: {
    color: "#bbb",
    fontSize: 12,
    marginBottom: 8,
  },
  beerPrice: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
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
});