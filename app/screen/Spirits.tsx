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
import { addProductToCart, fetchProducts } from "../(tabs)/api/db";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export default function Spirits() {
  const [spiritsTypes, setSpiritsTypes] = useState<SpiritsType[]>([]);
       const [loading, setLoading] = useState(true);
  

  interface SpiritsType {
      id: string;
      name: string;
      description: string;
      price: Float;
      image: any;
      popular: boolean;
    }
    
    interface CartItem {
        id: number;
        name: string;
        description: string;
        price: Float;
        image: any;
      }
    
     useEffect(() => {
        const loadProducts = async () => {
          try {
            const result = await fetchProducts();
            if (result.success) {
              const spirits = result.data?.filter(item => 
                item.categoryType.toLowerCase().includes("spirits")
              ) ?? [];
              setSpiritsTypes(spirits);
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
    const addCart = (num: string): void => {
        spiritsTypes.map((item: SpiritsType) => {
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

  const renderSpiritsItem = ({ item }: { item: { id: string; name: string; description: string; price: Float; image: string; popular: boolean; } }) => (
    <TouchableOpacity style={styles.spiritsCard}>
      <Image source = {typeof item.image === 'string' ? {uri: item.image}: item.image} style={styles.spiritsImage} />
      <View style={styles.spiritsInfo}>
        <Text style={styles.spiritsName}>{item.name}</Text>
        <Text style={styles.spiritsDescription}>{item.description}</Text>
        <Text style={styles.spiritsPrice}>{item.price}</Text>
        <TouchableOpacity style={styles.addButton} onPress = {() => addCart(item.id)}>
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
      <Link href="../screen/Cart">
        <Text style={styles.title}>Spirits Collection</Text>
        <Icon name="shopping-cart" size={22} color="#fff" />
        </Link>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        {/* <Image 
          source={require('../images/spirits.jpg')} 
          style={styles.bannerImage}
          resizeMode="cover"
        /> */}
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Spirits</Text>
          <Text style={styles.bannerText}>Discover our premium selection of spirits from around the world</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Spirits Types</Text>
      {/* Main list of all spirits types */}
      <FlatList
        data={spiritsTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderSpiritsItem}
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
  spiritsCard: {
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
  },
  spiritsImage: {
    width: 100,
    height: 150,
  },
  spiritsInfo: {
    flex: 1,
    padding: 12,
  },
  spiritsName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  spiritsDescription: {
    color: "#bbb",
    fontSize: 12,
    marginBottom: 8,
  },
  spiritsPrice: {
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