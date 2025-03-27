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

export default function Tequila() {
  // tequila types data with descriptions and images
  const [tequilaTypes, setTequilaTypes] = useState<TequilaType[]>([]);
       const [loading, setLoading] = useState(true);

  interface TequilaType {
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
              const tequila = result.data?.filter(item => 
                item.categoryType.toLowerCase().includes("tequila")
              ) ?? [];
              setTequilaTypes(tequila);
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
        tequilaTypes.map((item: TequilaType) => {
          if (item.id === num) {
            const cartItem: CartItem = {
              id: parseInt(item.id), 
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
            };
            addProductToCart(cartItem);
          }
        });
      };

  const renderTequilaItem = ({ item }: { item: { id: string; name: string; description: string; price: Float; image: string; popular: boolean; } }) => (
    <TouchableOpacity style={styles.tequilaCard}>
     <Image source = {typeof item.image === 'string' ? {uri: item.image}: item.image}  style = {styles.tequilaImage}/>
      <View style={styles.tequilaInfo}>
        <Text style={styles.tequilaName}>{item.name}</Text>
        <Text style={styles.tequilaDescription}>{item.description}</Text>
        <Text style={styles.tequilaPrice}>{item.price}</Text>
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
        <Link href="../screen/Cart">
        <Text style={styles.title}>tequila Collection</Text>
        <Icon name="shopping-cart" size={22} color="#fff" />
        </Link>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        {/* <Image 
          source={require('../images/tequila.jpg')} 
          style={styles.bannerImage}
          resizeMode="cover"
        /> */}
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Tequila</Text>
          <Text style={styles.bannerText}>Discover our premium selection of tequila from around the world</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Tequila Types</Text>
      {/* Main list of all tequila types */}
      <FlatList
        data={tequilaTypes}
        keyExtractor={(item) => item.id}
        renderItem={renderTequilaItem}
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
  tequilaCard: {
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    overflow: "hidden",
  },
  tequilaImage: {
    width: 100,
    height: 150,
  },
  tequilaInfo: {
    flex: 1,
    padding: 12,
  },
  tequilaName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tequilaDescription: {
    color: "#bbb",
    fontSize: 12,
    marginBottom: 8,
  },
  tequilaPrice: {
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