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

const AdminPanelScreen = ({ navigation }) => {
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [banList, setBanList] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/admin/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setAdminData(response.data.statistics);
      }
    } catch (error) {
      Alert.alert('Hata', 'Admin verileri yüklenemedi');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcılar yüklenemedi');
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${API_BASE_URL}/admin/users/${userId}/ban`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      Alert.alert('Başarılı', 'Kullanıcı yasaklandı');
      fetchAllUsers();
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı yasaklanamadı');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${API_BASE_URL}/admin/users/${userId}/unban`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      Alert.alert('Başarılı', 'Yasaklama kaldırıldı');
      fetchAllUsers();
    } catch (error) {
      Alert.alert('Hata', 'Yasaklama kaldırılamadı');
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      'Emin misiniz?',
      'Bu kullanıcı siliniyor ve geri alınamaz!',
      [
        { text: 'İptal', onPress: () => {} },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });

              Alert.alert('Başarılı', 'Kullanıcı silindi');
              fetchAllUsers();
            } catch (error) {
              Alert.alert('Hata', 'Kullanıcı silinemedi');
            }
          }
        }
      ]
    );
  };

  const renderStatCard = (title, value, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.username}</Text>
        <Text style={styles.userDetail}>{item.email}</Text>
        <Text style={styles.userStatus}>
          {item.isBanned ? '🚫 Yasaklı' : '✅ Aktif'}
        </Text>
      </View>
      <View style={styles.userActions}>
        {item.isBanned ? (
          <TouchableOpacity
            style={styles.unbanBtn}
            onPress={() => handleUnbanUser(item._id)}
          >
            <Text style={styles.actionBtnText}>Kaldır</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.banBtn}
            onPress={() => handleBanUser(item._id)}
          >
            <Text style={styles.actionBtnText}>Yasakla</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteUser(item._id)}
        >
          <Text style={styles.actionBtnText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>⚙️ ADMIN PANELİ</Text>
        <Text style={styles.description}>Uygulama yönetimi ve kontrol</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'stats' && styles.tabBtnActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'stats' && styles.tabBtnTextActive]}>
            📊 İstatistik
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab('users');
            fetchAllUsers();
          }}
        >
          <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
            👥 Kullanıcılar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'stats' ? (
          <View>
            <Text style={styles.sectionTitle}>İstatistikler</Text>
            {adminData && (
              <>
                {renderStatCard('Toplam Kullanıcı', adminData.totalUsers, '#3498db')}
                {renderStatCard('Aktif Kullanıcı', adminData.activeUsers, '#27ae60')}
                {renderStatCard('Yasaklı Kullanıcı', adminData.bannedUsers, '#e74c3c')}
                {renderStatCard('Toplam Grup', adminData.totalGroups, '#f39c12')}
                {renderStatCard('Toplam Mesaj', adminData.totalMessages, '#9b59b6')}
              </>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Kullanıcı Yönetimi</Text>
            {users.length > 0 ? (
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
            )}
          </View>
        )}
      </ScrollView>
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
    marginBottom: 5
  },
  description: {
    fontSize: 12,
    color: '#34495e'
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabBtnActive: {
    borderBottomColor: '#e74c3c'
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#95a5a6'
  },
  tabBtnTextActive: {
    color: '#e74c3c'
  },
  content: {
    padding: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 1
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  userItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  userDetail: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 4
  },
  userStatus: {
    fontSize: 11,
    color: '#34495e'
  },
  userActions: {
    flexDirection: 'row',
    gap: 8
  },
  banBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  unbanBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  deleteBtn: {
    backgroundColor: '#c0392b',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 20
  }
});

export default AdminPanelScreen;