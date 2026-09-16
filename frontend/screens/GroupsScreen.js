import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${API_BASE_URL}/groups/user/${userId}`);

      if (response.data.success) {
        setUserGroups(response.data.groups);
      }
    } catch (error) {
      console.log('Gruplar yüklenemedi');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || !groupDescription || !city || !district) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');

      const response = await axios.post(`${API_BASE_URL}/groups/create`, {
        name: groupName,
        description: groupDescription,
        creatorId: userId,
        location: { city, district }
      });

      if (response.data.success) {
        Alert.alert('Başarılı', 'Grup oluşturuldu!');
        setGroupName('');
        setGroupDescription('');
        setCity('');
        setDistrict('');
        setShowCreateModal(false);
        fetchUserGroups();
      }
    } catch (error) {
      Alert.alert('Hata', 'Grup oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchGroups = async () => {
    if (!city || !district) {
      Alert.alert('Hata', 'Adres belirtiniz');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/groups/location/${city}/${district}`
      );

      if (response.data.success) {
        setGroups(response.data.groups);
        setShowJoinModal(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'Gruplar alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      await axios.post(`${API_BASE_URL}/groups/${groupId}/join`, { userId });

      Alert.alert('Başarılı', 'Gruba katıldınız!');
      fetchUserGroups();
      setGroups([]);
    } catch (error) {
      Alert.alert('Hata', 'Gruba katılınamadı');
    }
  };

  const renderUserGroup = ({ item }) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
      <View style={styles.groupFooter}>
        <Text style={styles.groupMember}>👥 {item.memberCount} üye</Text>
        <TouchableOpacity style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>Aç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailableGroup = ({ item }) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDescription}>{item.description}</Text>
      <View style={styles.groupFooter}>
        <Text style={styles.groupMember}>👥 {item.memberCount} üye</Text>
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => handleJoinGroup(item._id)}
        >
          <Text style={styles.joinBtnText}>Katıl</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>👥 GRUPLAR</Text>
        <Text style={styles.description}>
          Aynı bölgedeki kişilerle grup oluşturun ve yardımlaşın.
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Grup Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => setShowJoinModal(true)}
        >
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Grup Ara</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text style={styles.sectionTitle}>Sizin Gruplarınız</Text>
        {userGroups.length > 0 ? (
          <FlatList
            data={userGroups}
            renderItem={renderUserGroup}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz gruba katılmadınız</Text>
          </View>
        )}
      </ScrollView>

      {/* Grup Oluştur Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Grup Oluştur</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Grup Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Grup adı giriniz"
                value={groupName}
                onChangeText={setGroupName}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Grup hakkında açıklama..."
                value={groupDescription}
                onChangeText={setGroupDescription}
                multiline={true}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.label}>Şehir</Text>
              <TextInput
                style={styles.input}
                placeholder="Şehir"
                value={city}
                onChangeText={setCity}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.label}>İlçe</Text>
              <TextInput
                style={styles.input}
                placeholder="İlçe"
                value={district}
                onChangeText={setDistrict}
                placeholderTextColor="#95a5a6"
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleCreateGroup}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Oluşturuluyor...' : 'GRUBU OLUŞTUR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grup Ara Modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grup Ara</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Şehir</Text>
              <TextInput
                style={styles.input}
                placeholder="Şehir"
                value={city}
                onChangeText={setCity}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.label}>İlçe</Text>
              <TextInput
                style={styles.input}
                placeholder="İlçe"
                value={district}
                onChangeText={setDistrict}
                placeholderTextColor="#95a5a6"
              />

              <FlatList
                data={groups}
                renderItem={renderAvailableGroup}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSearchGroups}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'Aranıyor...' : 'GRUPLARI LISTELE'}
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: 15
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  joinBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1
  },
  groupName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5
  },
  groupDescription: {
    fontSize: 12,
    color: '#34495e',
    marginBottom: 8
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTopWidth: 1,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1'
  },
  groupMember: {
    fontSize: 11,
    color: '#7f8c8d'
  },
  viewBtn: {
    backgroundColor: '#3498db',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  viewBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emptyText: {
    fontSize: 13,
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
    maxHeight: '85%'
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
  formContainer: {
    padding: 15
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 13
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  submitBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 15
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default GroupsScreen;