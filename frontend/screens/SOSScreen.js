import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  TextInput,
  Geolocation
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_BASE_URL = 'http://YOUR_BACKEND_URL/api';

const SOSScreen = ({ navigation }) => {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [showSosModal, setShowSosModal] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSOS = async () => {
    if (!description || !location) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${API_BASE_URL}/sos/create`,
        {
          userId,
          location: { city: location },
          description
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        Alert.alert('Başarılı', `SOS uyarısı gönderildi! ${response.data.notifiedCount} kişi bildirildi.`);
        setDescription('');
        setLocation('');
        setShowSosModal(false);
      }
    } catch (error) {
      Alert.alert('Hata', 'SOS uyarısı gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToSOS = async (sosId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('userToken');

      await axios.post(
        `${API_BASE_URL}/sos/${sosId}/respond`,
        { userId },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      Alert.alert('Başarılı', 'SOS uyarısına yanıt verdiniz!');
    } catch (error) {
      Alert.alert('Hata', 'Yanıt verilemedi');
    }
  };

  const renderSOSCard = ({ item }) => (
    <View style={styles.sosCard}>
      <View style={styles.sosHeader}>
        <View>
          <Text style={styles.sosTitle}>🆘 Acil Durum Bildirimi</Text>
          <Text style={styles.sosLocation}>📍 {item.location?.city}</Text>
        </View>
        <View style={[styles.sosStatus, { backgroundColor: item.status === 'active' ? '#e74c3c' : '#27ae60' }]}>
          <Text style={styles.sosStatusText}>
            {item.status === 'active' ? 'AKTİF' : 'ÇÖZÜLDÜ'}
          </Text>
        </View>
      </View>

      <Text style={styles.sosDescription}>{item.description}</Text>

      <View style={styles.sosFooter}>
        <Text style={styles.sosRespondCount}>
          👥 {item.respondingUsers?.length || 0} kişi yanıt verdi
        </Text>
        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.respondBtn}
            onPress={() => handleRespondToSOS(item._id)}
          >
            <Ionicons name="hand-right" size={14} color="#fff" />
            <Text style={styles.respondBtnText}>Yardıma Git</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>🆘 YARD IM ÇAĞRISI</Text>
        <Text style={styles.description}>
          Acil durumda hemen SOS çağrısı yapın. Bölgenizdeki tüm kullanıcılar bilgilendirilecektir.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createSOSBtn}
        onPress={() => setShowSosModal(true)}
      >
        <Ionicons name="alert-circle" size={18} color="#fff" />
        <Text style={styles.createSOSBtnText}>🆘 SOS ÇAĞRISI YAP</Text>
      </TouchableOpacity>

      <FlatList
        data={sosAlerts}
        renderItem={renderSOSCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>Aktif SOS çağrısı yok</Text>
          </View>
        }
      />

      {/* SOS Modal */}
      <Modal visible={showSosModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🆘 SOS ÇAĞRISI YAP</Text>
              <TouchableOpacity onPress={() => setShowSosModal(false)}>
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>📍 Konumunuz</Text>
              <TextInput
                style={styles.input}
                placeholder="Bulunduğunuz şehir/bölge"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.label}>📝 Durum Açıklaması</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Neler olduğunu kısaca anlatın..."
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={5}
                placeholderTextColor="#95a5a6"
              />

              <Text style={styles.warningText}>
                ⚠️ SOS çağrısı yapıldığında, Emniyet Müdürlüğü ve ilgili makamlar bilgilendirilecektir.
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.sendSOSBtn, loading && styles.sendSOSBtnDisabled]}
              onPress={handleCreateSOS}
              disabled={loading}
            >
              <Text style={styles.sendSOSBtnText}>
                {loading ? 'Gönderiliyor...' : '🆘 SOS ÇAĞRISI GÖNDER'}
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
  createSOSBtn: {
    backgroundColor: '#e74c3c',
    margin: 15,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  createSOSBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 10
  },
  sosCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    elevation: 2
  },
  sosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  sosTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  sosLocation: {
    fontSize: 12,
    color: '#34495e'
  },
  sosStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  sosStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  sosDescription: {
    fontSize: 12,
    color: '#34495e',
    lineHeight: 18,
    marginBottom: 10
  },
  sosFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTopWidth: 1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1'
  },
  sosRespondCount: {
    fontSize: 12,
    color: '#7f8c8d'
  },
  respondBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  respondBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100
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
    textAlignVertical: 'top',
    minHeight: 100
  },
  warningText: {
    fontSize: 12,
    color: '#e74c3c',
    lineHeight: 18,
    marginBottom: 15,
    fontStyle: 'italic'
  },
  sendSOSBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 15
  },
  sendSOSBtnDisabled: {
    opacity: 0.6
  },
  sendSOSBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
});

export default SOSScreen;