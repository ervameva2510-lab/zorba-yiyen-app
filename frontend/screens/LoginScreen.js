import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Linking,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre gereklidir');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userId', response.data.user.id);
        await AsyncStorage.setItem('isAdmin', response.data.user.isAdmin ? 'true' : 'false');
        
        Alert.alert('Başarılı', 'Giriş başarıyla gerçekleştirildi');
        // Navigation handled by App.js
      }
    } catch (error) {
      Alert.alert('Giriş Hatası', error.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openInstagram = () => {
    Linking.openURL('https://instagram.com/YOUR_INSTAGRAM_HANDLE');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>🚨 ZORBA YİYEN 🚨</Text>
        <Text style={styles.subtitle}>Sırtını once Allah'a Ver</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#95a5a6"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#95a5a6"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⚠️ Giriş Yapmadıysanız:</Text>
        <TouchableOpacity onPress={openInstagram}>
          <Text style={styles.instagramLink}>📱 Instagram Hesabından İletişime Geçin</Text>
        </TouchableOpacity>
        <Text style={styles.instagramHandle}>Instagram: @YOUR_HANDLE</Text>
      </View>

      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          ⚠️ BİZ SUÇ ÖRGÜTÜ DEĞİLİZ!\n\nBiz sadece ülkemizdeki kardeşlerimizin zorbalığa uğramaması için çalışıyoruz. Bu uygulama, zorbalık mağdurlarını korumak ve yardım etmek amacıyla kurulmuştur. Emniyet müdürlükleri ve savcılıklara bilgi verilmektedir.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ecf0f1',
    padding: 20,
    justifyContent: 'center'
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#34495e',
    fontStyle: 'italic'
  },
  formContainer: {
    marginBottom: 30
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderColor: '#bdc3c7',
    borderWidth: 1
  },
  button: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10
  },
  instagramLink: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginBottom: 5
  },
  instagramHandle: {
    fontSize: 12,
    color: '#666'
  },
  warningContainer: {
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545'
  },
  warningText: {
    fontSize: 12,
    color: '#721c24',
    lineHeight: 18
  }
});

export default LoginScreen;