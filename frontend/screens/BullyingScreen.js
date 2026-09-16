import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  Modal,
  TextInput,
  Picker
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const BullyingScreen = ({ navigation }) => {
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [sportType, setSportType] = useState('');
  const [fitnessStatus, setFitnessStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sportOptions = ['Sporcu', 'Acemi', 'Boksör', 'Muay Thai', 'Judo', 'BJJ'];
  const fitnessOptions = ['Fit', 'Yarı Fit', 'Hafif Göbekli', 'Göbekli', 'Obez'];

  const handleSearch = async () => {
    if (!city || !district) {
      Alert.alert('Hata', 'Lütfen adres belirtiniz');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/profiles/filter`, {
        location: { city, district },
        sportType: sportType || undefined,
        fitnessStatus: fitnessStatus || undefined,
        tag: 'Zorbalığa Gelirim'
      });

      if (response.data.success) {
        setFilteredProfiles(response.data.profiles);
        setShowFilters(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'Profiller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileCard = ({ item }) => (
    <View style={styles.profileCard}>
      <Image source={{ uri: item.profilePhoto }} style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{item.username}</Text>
        <Text style={styles.profileDetail}>📍 {item.location?.city}</Text>
        <Text style={styles.profileDetail}>💪 {item.fitnessStatus}</Text>
        <Text style={styles.profileDetail}>🏷️ {item.tag}</Text>
      </View>
      <View style={styles.profileActions}>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="mail" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Mesaj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inviteButton}>
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Davet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>🚨 ZORBALIĞA UĞRADIM</Text>
        <Text style={styles.description}>
          Eğer zorbalığa uğradıysanız, burada yardım isteyebilirsiniz.{' '}
          Seçtiğiniz bölgedeki yardımcı profillere anında ulaşacaksınız.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="funnel" size={18} color="#fff" />
        <Text style={styles.filterButtonText}>Filtreleme Menüsü</Text>
      </TouchableOpacity>

      {filteredProfiles.length > 0 ? (
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>Filtreleme yapınız</Text>
        </View>
      )}

      {/* Filtreleme Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 FİLTRELEME</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterForm}>
              <Text style={styles.filterLabel}>📍 Adres Belirle</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Şehir"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="İlçe"
                value={district}
                onChangeText={setDistrict}
              />

              <Text style={styles.filterLabel}>🏋️ Spor Türü</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sportOptions.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.filterOption,
                      sportType === sport && styles.filterOptionActive
                    ]}
                    onPress={() => setSportType(sport)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        sportType === sport && styles.filterOptionTextActive
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>💪 Fitness Durumu</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {fitnessOptions.map((fitness) => (
                  <TouchableOpacity
                    key={fitness}
                    style={[
                      styles.filterOption,
                      fitnessStatus === fitness && styles.filterOptionActive
                    ]}
                    onPress={() => setFitnessStatus(fitness)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        fitnessStatus === fitness && styles.filterOptionTextActive
                      ]}
                    >
                      {fitness}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={loading}
            >
              <Text style={styles.searchButtonText}>
                {loading ? 'Aranıyor...' : '🔍 ARA'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1'
  },
  headerSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10
  },
  description: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18
  },
  filterButton: {
    backgroundColor: '#e74c3c',
    margin: 10,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8
  },
  listContainer: {
    padding: 10
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2
  },
  profileImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#bdc3c7'
  },
  profileInfo: {
    padding: 12
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  profileDetail: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 4
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1'
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5
  },
  inviteButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#95a5a6'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 30,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  filterForm: {
    padding: 15
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    marginTop: 10
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  filterOption: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10
  },
  filterOptionActive: {
    backgroundColor: '#e74c3c'
  },
  filterOptionText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500'
  },
  filterOptionTextActive: {
    color: '#fff'
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 15
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default BullyingScreen;