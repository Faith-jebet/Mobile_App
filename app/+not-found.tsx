import { Link, Stack } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function NotFoundScreen() {
  return (
    <>
      <StatusBar style="light" />

      {/* Correctly defining the screen options */}
      <Stack.Screen options={{ title: "Page not found!!" }} />

      {/* The main view content */}
      <SafeAreaView style={styles.container}>
        <Text style={{ color: "red", fontSize: 18 }}>Page not found!</Text>
        <Link href="/">Go to home</Link>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "plum",
  },
});
