import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const ProfileCreationScreen = ({ navigation }) => {
  const [photo, setPhoto] = useState(null);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [sportStatus, setSportStatus] = useState('');
  const [fitnessStatus, setFitnessStatus] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);

  const sportOptions = ['Sporcu', 'Acemi', 'Başlamamış'];
  const fitnessOptions = ['Fit', 'Yarı Fit', 'Hafif Göbekli', 'Göbekli', 'Obez'];
  const tagOptions = ['Haklıysan Kavgaya Gelirim', 'Zorbalığa Gelirim'];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    if (!result.cancelled) {
      setPhoto(result.uri);
    }
  };

  const handleCreateProfile = async () => {
    if (!photo || !city || !district || !sportStatus || !fitnessStatus || !tag) {
      Alert.alert('Hata', 'Lütfen Tüm Alanları Doldurunuz!');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      const formData = new FormData();
      formData.append('profilePhoto', {
        uri: photo,
        type: 'image/jpeg',
        name: 'profile.jpg'
      });
      formData.append('location', JSON.stringify({ city, district }));
      formData.append('sportStatus', sportStatus);
      formData.append('fitnessStatus', fitnessStatus);
      formData.append('tag', tag);
      formData.append('sözleşmeKabul', 'true');
      formData.append('politikaKabul', 'true');

      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        await AsyncStorage.setItem('profileCompleted', 'true');
        Alert.alert('Başarılı', 'Profil başarıyla oluşturuldu');
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Hata', error.response?.data?.error || 'Profil oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>✅ PROFİL OLUŞTURUN</Text>
        <Text style={styles.subtitle}>⚠️ Tüm Alanlar Zorunludur!</Text>
      </View>

      {/* Fotoğraf Yükleme */}
      <View style={styles.photoSection}>
        <Text style={styles.label}>📸 FOTOĞRAF YÜKLE</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoButtonText}>Fotoğraf Seç (Min. 1 Foto)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Konum Bilgisi */}
      <View style={styles.section}>
        <Text style={styles.label}>📍 NEREDE YAŞIYORSUNUZ?</Text>
        <TextInput
          style={styles.input}
          placeholder="Şehir Seçin"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#95a5a6"
        />
        <TextInput
          style={styles.input}
          placeholder="İlçe Seçin"
          value={district}
          onChangeText={setDistrict}
          placeholderTextColor="#95a5a6"
        />
      </View>

      {/* Spor Durumu */}
      <View style={styles.section}>
        <Text style={styles.label}>⚽ SPOR DURUMUNUZ?</Text>
        <View style={styles.optionsContainer}>
          {sportOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, sportStatus === option && styles.optionButtonActive]}
              onPress={() => setSportStatus(option)}
            >
              <Text style={[styles.optionText, sportStatus === option && styles.optionTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fitness Durumu */}
      <View style={styles.section}>
        <Text style={styles.label}>💪 FİZYOLOJİK DURUM?</Text>
        <View style={styles.optionsContainer}>
          {fitnessOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, fitnessStatus === option && styles.optionButtonActive]}
              onPress={() => setFitnessStatus(option)}
            >
              <Text style={[styles.optionText, fitnessStatus === option && styles.optionTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Etiket Seçimi */}
      <View style={styles.section}>
        <Text style={styles.label}>🏷️ ETİKET SEÇİN (Sadece Bir Tane)</Text>
        <Text style={styles.warningText}>⚠️ En az birini MUTLAKA seçmelisiniz!</Text>
        <View style={styles.optionsContainer}>
          {tagOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.tagButton, tag === option && styles.tagButtonActive]}
              onPress={() => setTag(option)}
            >
              <Text style={[styles.tagText, tag === option && styles.tagTextActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Oluştur Butonu */}
      <TouchableOpacity
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreateProfile}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Profil Oluşturuluyor...' : '✅ PROFİLİ OLUŞTUR'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ecf0f1',
    padding: 15
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#c0392b'
  },
  photoSection: {
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10
  },
  photoButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e74c3c',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150
  },
  photoButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: 'bold'
  },
  photoPreview: {
    width: 200,
    height: 150,
    borderRadius: 8
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#2c3e50'
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  optionButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    width: '48%',
    borderWidth: 1,
    borderColor: '#bdc3c7'
  },
  optionButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b'
  },
  optionText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500'
  },
  optionTextActive: {
    color: '#fff'
  },
  tagButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#bdc3c7'
  },
  tagButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b'
  },
  tagText: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '500'
  },
  tagTextActive: {
    color: '#fff'
  },
  warningText: {
    fontSize: 12,
    color: '#e74c3c',
    marginBottom: 10,
    fontStyle: 'italic'
  },
  createButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 30
  },
  createButtonDisabled: {
    opacity: 0.6
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ProfileCreationScreen;