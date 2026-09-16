import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Çıkmak istediğinize emin misiniz?', [
      {
        text: 'İptal',
        onPress: () => {}
      },
      {
        text: 'Çıkış Yap',
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('profileCompleted');
          await AsyncStorage.removeItem('policyAccepted');
          navigation.replace('Login');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil Fotoğrafı */}
      <View style={styles.photoContainer}>
        {user?.profilePhoto ? (
          <Image source={{ uri: user.profilePhoto }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" size={80} color="#95a5a6" />
          </View>
        )}
      </View>

      {/* Profil Bilgileri */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Kullanıcı Adı:</Text>
          <Text style={styles.infoValue}>{user?.username}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Konum:</Text>
          <Text style={styles.infoValue}>{user?.location?.city} - {user?.location?.district}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⚽ Spor Durumu:</Text>
          <Text style={styles.infoValue}>{user?.sportStatus}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>💪 Fitness Durumu:</Text>
          <Text style={styles.infoValue}>{user?.fitnessStatus}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🏷️ Etiket:</Text>
          <Text style={styles.infoValue}>{user?.tag}</Text>
        </View>
      </View>

      {/* Butonlar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={18} color="#fff" />
          <Text style={styles.buttonText}>Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.passwordButton}>
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={styles.buttonText}>Şifre Değiştir</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={18} color="#fff" />
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff'
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#e74c3c'
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#95a5a6'
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    padding: 15
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  infoValue: {
    fontSize: 14,
    color: '#34495e'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  passwordButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 30
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5
  }
});

export default ProfileScreen;