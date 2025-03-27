import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";

interface AdminPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function AdminPasswordModal({ visible, onClose, onSubmit }: AdminPasswordModalProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password === "admin123") { 
      onSubmit();
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Admin Login</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter Admin Password"
            placeholderTextColor="#ddd"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
            <Text style={styles.modalButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#121212",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 5,
    color: "#fff",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#f54266",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});