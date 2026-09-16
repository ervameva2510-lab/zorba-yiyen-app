import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const FightScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Hata', 'Arama terimi giriniz');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/profiles/filter`,
        {
          params: {
            tag: 'Haklıysan Kavgaya Gelirim'
          }
        }
      );

      if (response.data.success) {
        const filtered = response.data.profiles.filter(p =>
          p.username.toLowerCase().includes(searchText.toLowerCase()) ||
          p.location.city.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(filtered);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcılar alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId) => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      await axios.post(
        `${API_BASE_URL}/messages/send`,
        {
          senderId: currentUserId,
          recipientId: userId,
          content: '🤝 Sana kavgaya çağrı gönderdim! Haklıysan gel karşı karşıya konuşalım.',
          messageType: 'invitation'
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      Alert.alert('Başarılı', 'Davet gönderildi!');
    } catch (error) {
      Alert.alert('Hata', 'Davet gönderilemedi');
    }
  };

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userDetail}>📍 {item.location?.city}</Text>
        <Text style={styles.userDetail}>💪 {item.fitnessStatus}</Text>
        <Text style={styles.userDetail}>🏷️ {item.tag}</Text>
      </View>
      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => handleInvite(item._id)}
      >
        <Ionicons name="person-add" size={16} color="#fff" />
        <Text style={styles.inviteBtnText}>Davet Et</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>⚔️ KAVGAYA ADAM ÇAğUR</Text>
        <Text style={styles.description}>
          Haklı olduğunu düşün ve karşı tarafla yapı yapı konuşmak istiyorsan, burada uygun kişileri bulabilirsin.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı adı veya şehir ara..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#95a5a6"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-remove" size={60} color="#bdc3c7" />
          <Text style={styles.emptyText}>Arama yapınız</Text>
        </View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#fff'
  },
  searchBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 10
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6
  },
  userDetail: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 3
  },
  inviteBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  inviteBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
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
  }
});

export default FightScreen;