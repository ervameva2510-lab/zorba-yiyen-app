import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import io from 'socket.io-client';

const API_BASE_URL = 'http://YOUR_BACKEND_URL';
const SOCKET_URL = 'http://YOUR_BACKEND_URL';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeMessaging();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const initializeMessaging = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);

      // Socket.io bağlantısı
      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketRef.current.on('connect', () => {
        console.log('Socket bağlandı');
        socketRef.current.emit('joinRoom', id);
      });

      socketRef.current.on('receiveMessage', (data) => {
        if (data.senderId === selectedUser?._id) {
          setMessages(prev => [...prev, data]);
        }
      });

      fetchInbox(id);
    } catch (error) {
      console.error('Messaging initialize hatası:', error);
    }
  };

  const fetchInbox = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/inbox/${id}`);
      if (response.data.success) {
        // Unique conversations
        const uniqueConversations = response.data.messages.reduce((acc, msg) => {
          const senderId = msg.senderId._id;
          if (!acc.find(c => c._id === senderId)) {
            acc.push(msg.senderId);
          }
          return acc;
        }, []);
        setConversations(uniqueConversations);
      }
    } catch (error) {
      console.error('Inbox yükleme hatası:', error);
    }
  };

  const fetchMessages = async (recipientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/messages/between/${userId}/${recipientId}`
      );
      if (response.data.success) {
        setMessages(response.data.messages);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Hata', 'Mesajlar yüklenemedi');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Hata', 'Mesaj yazınız');
      return;
    }

    const newMessage = {
      senderId: userId,
      recipientId: selectedUser._id,
      content: messageText,
      timestamp: new Date(),
      isRead: false
    };

    try {
      await axios.post(`${API_BASE_URL}/api/messages/send`, newMessage);

      setMessages(prev => [...prev, newMessage]);
      setMessageText('');

      // Socket.io ile gönder
      socketRef.current?.emit('sendMessage', newMessage);

      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedUser?._id === item._id && styles.conversationItemActive
      ]}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={50} color="#e74c3c" />
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.username}</Text>
        <Text style={styles.conversationLocation}>
          📍 {item.location?.city || 'Bilinmeyen'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#bdc3c7" />
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId._id === userId || item.senderId === userId;

    return (
      <View style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}>
        <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
          <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
            {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (!selectedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>💬 MESAJLAR</Text>
          <Text style={styles.description}>Mesajlaşmak için bir kullanıcı seçin</Text>
        </View>

        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail" size={60} color="#bdc3c7" />
            <Text style={styles.emptyText}>Henüz mesaj yok</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Sohbet Başlığı */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedUser(null)}>
          <Ionicons name="chevron-back" size={24} color="#e74c3c" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{selectedUser.username}</Text>
          <Text style={styles.chatHeaderLocation}>
            📍 {selectedUser.location?.city || 'Bilinmeyen'}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={22} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      {/* Mesajlar */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        onEndReachedThreshold={0.1}
      />

      {/* Mesaj Gönderme */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesaj yazın..."
          value={messageText}
          onChangeText={setMessageText}
          placeholderTextColor="#95a5a6"
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  conversationItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1
  },
  conversationItemActive: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c'
  },
  avatarContainer: {
    marginRight: 12
  },
  conversationInfo: {
    flex: 1
  },
  conversationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4
  },
  conversationLocation: {
    fontSize: 11,
    color: '#7f8c8d'
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
  chatHeader: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  chatHeaderInfo: {
    flex: 1
  },
  chatHeaderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  chatHeaderLocation: {
    fontSize: 11,
    color: '#7f8c8d'
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 10
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row'
  },
  messageContainerOwn: {
    justifyContent: 'flex-end'
  },
  messageBubble: {
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '75%'
  },
  messageBubbleOwn: {
    backgroundColor: '#e74c3c'
  },
  messageText: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 4
  },
  messageTextOwn: {
    color: '#fff'
  },
  messageTime: {
    fontSize: 10,
    color: '#7f8c8d'
  },
  messageTimeOwn: {
    color: 'rgba(255,255,255,0.7)'
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 13,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default MessagesScreen;