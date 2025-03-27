import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Icon from "react-native-vector-icons/FontAwesome";
import { Link } from "expo-router";
import { supabase } from "../lib/supabase";
import { fetchProducts, Order, StockItem } from "../(tabs)/api/db";
import { OrderService, StockService } from "../(tabs)/api/db";

export default function Admin() {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState<Partial<StockItem>>({
    name: '',
    price: 0,
    categoryType: '',
    imageUrl: '',
    description: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchProducts();
        if (result.success) {
          const stock = result.data ?? [];
          setStock(stock);
        } else {
          console.error("Error fetching products:", result.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    loadProducts();
  }, []);

  // Unified data loading method
  const loadData = async () => {
    try {
      const [fetchedOrders] = await Promise.all([
        OrderService.fetchOrders(),
      ]);

      setOrders(fetchedOrders);
    } catch (error) {
      Alert.alert('Error', 'Could not load data');
    }
  };

  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setNewItem({
        ...newItem, 
        imageUrl: result.assets[0].uri
      });
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (uri: string) => {
    try {
      const file = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const filePath = `stock-images/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('stock-images')
        .upload(filePath, new Uint8Array(Buffer.from(file, 'base64')), {
          contentType: 'image/jpg'
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('stock-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Could not upload image');
      return null;
    }
  };

  // Save Stock Item
  const handleSaveStockItem = async () => {
    // Validate required fields
    if (!newItem.name || !newItem.categoryType || !newItem.description || newItem.price === undefined) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Category, Price, Description)');
      return;
    }

    try {
      // Upload image if a new image is selected
      let imageUrl = newItem.imageUrl;
      if (imageUri && imageUri !== newItem.imageUrl) {
        imageUrl = await uploadImage(imageUri);
      }

      const stockItemData = {
        id: newItem.id || Date.now(), // Use existing ID or generate new
        name: newItem.name,
        price: Number(newItem.price), // Ensure price is a number
        categoryType: newItem.categoryType,
        description: newItem.description,
        imageUrl: imageUrl || '', // Allow empty string if no image
      };

      if (newItem.id) {
        // Update existing item
        await StockService.updateStockItem(String(newItem.id), stockItemData);
      } else {
        // Add new item
        await StockService.addStockItem(stockItemData);
      }

      // Reload data and reset modal
      loadData();
      setModalVisible(false);
      resetNewItemState();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save stock item');
    }
  };

  // Reset new item state
  const resetNewItemState = () => {
    setNewItem({
      name: '',
      price: 0,
      categoryType: '',
      imageUrl: '',
    });
    setImageUri(null);
  };

  // Render stock item modal
  const renderStockModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          placeholderTextColor="#888"
          value={newItem.name}
          onChangeText={(text) => setNewItem({...newItem, name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Category Type"
          placeholderTextColor="#888"
          value={newItem.categoryType}
          onChangeText={(text) => setNewItem({...newItem, categoryType: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={newItem.price ? String(newItem.price) : ''}
          onChangeText={(text) => setNewItem({...newItem, price: parseFloat(text) || 0})}
        />
           <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#888"
          value={newItem.description}
          onChangeText={(text) => setNewItem({...newItem, description: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL (Optional)"
          placeholderTextColor="#888"
          value={newItem.imageUrl || ''}
          onChangeText={(text) => setNewItem({ ...newItem, imageUrl: text })}
        />
        
        {/* <TouchableOpacity 
          style={styles.imagePickerButton} 
          onPress={pickImage}
        >
          <Text style={styles.buttonText}>
            {imageUri ? 'Change Image' : 'Upload Image'}
          </Text>
        </TouchableOpacity> */} 
        
        {(imageUri || newItem.imageUrl) && (
          <Image 
            source={{ uri: imageUri || newItem.imageUrl }} 
            style={styles.imagePreview} 
          />
        )}

        <View style={styles.modalButtonContainer}>
          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={handleSaveStockItem}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={() => {
              setModalVisible(false);
              resetNewItemState();
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleDeleteStockItem = async (id: string) => {
    // Add confirmation dialog before deletion
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this stock item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StockService.deleteStockItem(id);
              // Reload data after successful deletion
              loadData();
              Alert.alert('Success', 'Stock item deleted successfully');
            } catch (error) {
              console.error('Deletion error:', error);
              Alert.alert('Error', 'Could not delete stock item');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Link href="/" asChild>
           <TouchableOpacity>
             <Icon name="arrow-left" size={20} color="#fff" />
           </TouchableOpacity>
         </Link>
      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {/* <Text style={styles.itemText}>Product: {item.product}</Text> */}
            <Text style={styles.itemText}>Product Name: {item.name}</Text>
            <Text style={styles.itemText}>Price: {item.price}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionStock}>Stock</Text>
      <FlatList
        data={stock}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.imageUrl && (
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.stockImage} 
              />
            )}
            <Text style={styles.itemText}>Category: {item.categoryType}</Text>
            <Text style={styles.itemText}>Product Name: {item.name}</Text>
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setNewItem(item);
                  setImageUri(item.imageUrl);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteStockItem(String(item.id))}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          setNewItem({ product: '', name: '', description: ''});
          setImageUri(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Add Stock Item</Text>
      </TouchableOpacity>

      {renderStockModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20, // Increased from 10 to 20
    paddingVertical: 10, // Add vertical padding
    height: 50, // Adjust height as needed
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sectionStock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    paddingVertical: 10, // Add vertical padding
    height: 50, // Consistent height
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  item: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemText: {
    color: "#fff",
  },
  button: {
    backgroundColor: "yellow",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  input: {
    backgroundColor: "#fff",
    color: "#000",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  stockImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  imagePickerButton: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10,
  },
});