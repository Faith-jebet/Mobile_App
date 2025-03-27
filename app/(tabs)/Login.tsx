import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { supabase } from '../lib/supabase'
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
import AdminPasswordModal from "../screen/AdminPasswordModal"; 
import logo from '../(tabs)/src/images/logo.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  // Function to check if a session already exists
  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is already logged in, redirect to home
      router.push("/");
    }
  }

  async function handleLogin() {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        alert(error.message);
      } else {
        try{
          const sessionString = JSON.stringify(data.session);
          await AsyncStorage.setItem("supabase_session", sessionString);

          const userString = JSON.stringify(data.user);
          await AsyncStorage.setItem("user_data", userString);
          Alert.alert("Success", "Login Successful");
          router.push("/");
        } catch (storageError) {
          console.error("Error storing session:", storageError);
        }
      }
    } catch (error) {
      alert("An error occurred during login");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
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

  const handleAdmminSubmit = () => {
    setModalVisible(true);
    router.push("../screen/Admin");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image source={logo} style={styles.logo} />

      <Text style={styles.title}>TECHALCHEMY LIQUORS</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ddd"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      
      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ddd"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Text style={styles.showText}>
            {passwordVisible ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Remember Me and Forgot Password */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity>
          <Text style={styles.rememberMe}>Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? "Logging in..." : "Log in"}
        </Text>
      </TouchableOpacity>

      {/* Social Login */}
      <Text style={styles.orText}>Or Sign in with</Text>
      <View style={styles.socialContainer}>
        <Icon
          name="facebook"
          size={30}
          color="#3b5998"
          style={styles.socialIcon}
        />
        <Icon
          name="twitter"
          size={30}
          color="#1DA1F2"
          style={styles.socialIcon}
        />
        <Icon
          name="google"
          size={30}
          color="#DB4437"
          style={styles.socialIcon}
        />
        <Icon
          name="instagram"
          size={30}
          color="#C13584"
          style={styles.socialIcon}
        />
      </View>

      {/* Sign Up Link */}
      <Text style={styles.signUpText}>
        Don't have an account? <Link href="/Signup" style={styles.signUpLink}>Sign up</Link>
      </Text>
      
      {/* admin login */}
      <View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.adminText} >
            Continue as Admin 
          </Text>
        </TouchableOpacity>
      </View>
      
      <AdminPasswordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAdmminSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#121212",
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: 50, // Make the logo circular
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
      marginBottom: 20,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#222",
      width: 280,
      paddingHorizontal: 10,
      borderRadius: 10,
      marginBottom: 15,
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      color: "#fff",
    },
    showText: {
      color: "#f54266",
      fontWeight: "bold",
    },
    optionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: 280,
      marginBottom: 20,
    },
    rememberMe: {
      color: "#ddd",
    },
    forgotPassword: {
      color: "#f54266",
    },
    loginButton: {
      backgroundColor: "#f54266",
      width: 280,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
    },
    loginButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
    orText: {
      color: "#ddd",
      marginBottom: 10,
    },
    socialContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 20,
    },
    socialIcon: {
      marginHorizontal: 10,
    },
    signUpText: {
      color: "#ddd",
    },
    signUpLink: {
      color: "#f54266",
      fontWeight: "bold",
    },
    adminText: {
      color: "#f54266",
      fontWeight: "bold",
    }
});