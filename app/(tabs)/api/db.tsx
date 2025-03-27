import { View, Text } from 'react-native'
import React from 'react'
import { supabase } from '../../lib/supabase'
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

interface Product {
    [key: string]: any; // Replace `any` with specific types
    id: number;
}
export interface Order {
    id: string;
    product: string;
    name: string;
    price: number;
  }
  
  export interface StockItem {
    id: number;
    name: string;
    product?: string;
    price: Float;
    imageUrl?: string | any;
    categoryType?: string; // Added categoryType property
    description?: string; // Added description property
  }
  export interface Category {
    id: string;
    name: string;
    description: string;
    categoryType: string;
    image: any;
  }
export const OrderService = {
    async fetchOrders() {
        const {data, error} = await supabase
            .from('order')
            .select('*');

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data as Order [];    
    },     
};
export const StockService = {
    async fetchStock(){
        const {data, error} = await supabase
            .from('product')
            .select('*');
        if (error) {
            console.error('Error fetching stock:', error);
            return [];
        }
        return data as StockItem [];
    },
    async addStockItem(item: StockItem){
        // Extract only the columns that exist in your schema
        const { id, name, price, categoryType, description, imageUrl } = item;
        
        const stockItem = {
            name,
            price,
            categoryType: categoryType,
            description: description || null, // Use null if no description
            image: imageUrl || null // Use null if no image URL
        };

        const {data, error} = await supabase
            .from('product')
            .insert([stockItem])
            .select('*');
        
        if (error) {
            console.error('Error adding stock item:', error);
            throw error; // Throw error for better error handling
        }
        
        console.log('Stock item added:', data);
        return data;
    },
    async updateStockItem(id: string, item: Partial<StockItem>){
        // Extract only the columns that exist in your schema
        const updateData = {
            name: item.name,
            price: item.price,
            categoryType: item.categoryType,
            image: item.imageUrl || null
        };

        const {data, error} = await supabase
            .from('product')
            .update(updateData)
            .eq('id', id)
            .select('*');
        
        if (error) {
            console.error('Error updating stock item:', error);
            throw error; // Throw error for better error handling
        }
        
        console.log('Stock item updated:', data);
        return data;
    },
    async deleteStockItem(id: string){
        const {data, error} = await supabase
            .from('product')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting stock item:', error);
            throw error; // Throw error for better error handling
        }
        
        console.log('Stock item deleted:', data);
        return data;
    }
};
export const addProductToCart = async (product: Product) => {
    try {
        const { data, error } = await supabase
            .from('cart')
            .insert(product);


        if (error) {
            console.error('Error adding product to cart:', error);
        } else {
            console.log('Product added to cart:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};


export const addOrder = async (product: Product, userId: string ) => {
    if (!userId || userId === '') {
        console.error('User ID is required');
        return;
    }
    try {
        const { data, error } = await supabase
            .from('order')
            .insert({...product, UID: userId});

        if (error) {
            console.error('Error adding order:', error);
            return;
        } else {
            console.log('Product added to order:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};


export const fetchCartItems = async () => {
    try {
        const { data, error } = await supabase
            .from('cart')
            .select('*');
        
        if (error) {
            console.error('Error fetching cart items:', error);
            return { success: false, error };
        } else {
            console.log('Cart items retrieved:', data);
            return { success: true, data };
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, error: err };
    }
};

export const fetchProducts = async () => {
    try {
        const { data, error } = await supabase
            .from('product')
            .select('*');
        
        if (error) {
            console.error('Error fetching product items:', error);
            return { success: false, error };
        } else {
            console.log('Products retrieved:', data);
            return { success: true, data };
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, error: err };
    }
};

export const removeFromCart = async (itemId: number) => {
    try {
        const { data, error } = await supabase
            .from('cart')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error adding product to cart:', error);
        } else {
            console.log('Product removed from cart:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};
export const removeFromOrder = async (itemId: number) => {
    try {
        const { data, error } = await supabase
            .from('order')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error('Error removing order:', error);
        } else {
            console.log('Product removed from order:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};
// export const removeOrder = async () => {
//     try {
//         const { data, error } = await supabase
//             .from('order')
//             .delete();
           

//         if (error) {
//             console.error('Error adding product to cart:', error);
//         } else {
//             console.log('Product removed from cart:', data);
//         }
//     } catch (err) {
//         console.error('Unexpected error:', err);
//     }
// };
export const handleStockItem = async () => {
    try {
        const { data, error } = await supabase
            .from('order')
            .select('*');
        
        if (error) {
            console.error('Error fetching orders:', error);
            return { success: false, error };
        } else {
            console.log('Orders retrieved:', data);
            return { success: true, data };
        }
    } catch (err) {
        console.error('Unexpected error:', err);
        return { success: false, error: err };
    }
};
