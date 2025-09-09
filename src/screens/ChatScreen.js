import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

export default function ChatScreen({ navigation }) {
  // State untuk socket dan chat
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      // Get current user data
      const userData = await ApiService.getCurrentUser();
      if (!userData) {
        Alert.alert('Error', 'Anda harus login terlebih dahulu');
        navigation.navigate('Login');
        return;
      }

      setCurrentUser(userData);

      // Get admin user (assuming admin ID is 1)
      const admin = await getAdminUser();
      setAdminUser(admin);

      // Initialize socket connection
      const newSocket = io('http://192.168.1.4:5000', {
        forceNew: true,
        transports: ['websocket'],
      });

      setSocket(newSocket);

      // Handle socket events
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        // Join room
        const roomData = {
          userId: userData.id,
          adminId: admin.id,
          userType: 'user',
        };
        console.log('Joining room with data:', roomData);
        newSocket.emit('join_room', roomData);
      });

      newSocket.on('room_joined', data => {
        console.log('Joined room successfully:', data);
      });

      newSocket.on('receive_message', messageData => {
        console.log('Received message:', messageData);
        setMessages(prev => {
          // Check if this is replacing a temporary message (optimistic update)
          const tempMsgIndex = prev.findIndex(
            msg =>
              msg.id &&
              typeof msg.id === 'string' &&
              msg.id.startsWith('temp-') &&
              msg.senderId === messageData.senderId &&
              msg.message === messageData.message,
          );

          if (tempMsgIndex !== -1) {
            // Replace temporary message with real one from server
            const updatedMessages = [...prev];
            updatedMessages[tempMsgIndex] = messageData;
            return updatedMessages;
          }

          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => {
            // Safe comparison with null/undefined checks
            if (msg.id && messageData.id && msg.id === messageData.id) {
              return true;
            }
            // Check for duplicate content with time proximity
            return (
              msg.message === messageData.message &&
              msg.senderId === messageData.senderId &&
              msg.createdAt &&
              messageData.createdAt &&
              Math.abs(
                new Date(msg.createdAt) - new Date(messageData.createdAt),
              ) < 1000
            );
          });

          if (messageExists) {
            return prev;
          }

          return [...prev, messageData];
        });
      });

      newSocket.on('conversation_started', data => {
        console.log('Conversation started by admin:', data);
        setConversationStarted(true);
        Alert.alert(
          'Obrolan Dimulai',
          'Admin telah memulai obrolan. Sekarang Anda dapat membalas pesan.',
          [{ text: 'OK' }],
        );
      });

      newSocket.on('user_typing', data => {
        if (data.userType === 'admin') {
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      // Load chat history and check conversation status
      if (userData && admin) {
        await checkConversationStatus(userData.id, admin.id);
        await loadChatHistory(userData.id, admin.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Gagal menginisialisasi chat');
    }
  };

  const getAdminUser = async () => {
    // Use the correct admin ID from database
    return {
      id: 2,
      firstName: 'Administrator',
      lastName: 'PKBI Kepri',
      email: 'pkbikepri@pkbi.or.id',
      isAdmin: true,
    };
  };

  const checkConversationStatus = async (userId, adminId) => {
    try {
      console.log(
        `Checking conversation status for user ${userId} and admin ${adminId}`,
      );
      const response = await fetch(
        `http://192.168.1.4:5000/api/chat/conversation-status/${userId}/${adminId}`,
      );
      const data = await response.json();

      if (data.success) {
        console.log('Conversation status:', data);
        setConversationStarted(data.conversationStarted);

        if (!data.conversationStarted) {
          console.log('Conversation not started by admin yet');
        }
      }
    } catch (error) {
      console.error('Error checking conversation status:', error);
      setConversationStarted(false);
    }
  };

  const loadChatHistory = async (userId, adminId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://192.168.1.4:5000/api/chat/history/${userId}/${adminId}`,
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.chats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    // Check if conversation has been started by admin
    if (!conversationStarted) {
      Alert.alert(
        'Pesan Belum Tersedia',
        'Admin belum memulai obrolan. Silakan tunggu admin menghubungi Anda terlebih dahulu.',
        [{ text: 'OK' }],
      );
      return;
    }

    if (newMessage.trim() && socket && currentUser && adminUser) {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const messageData = {
        id: tempId,
        senderId: currentUser.id,
        receiverId: adminUser.id,
        message: newMessage.trim(),
        userType: 'user',
        createdAt: new Date().toISOString(),
      };

      // Add message optimistically to UI
      setMessages(prev => [...prev, messageData]);

      console.log('Sending message:', messageData);
      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  const handleFileAttachment = () => {
    if (!conversationStarted) {
      Alert.alert(
        'Pesan Belum Tersedia',
        'Admin belum memulai obrolan. Silakan tunggu admin menghubungi Anda terlebih dahulu.',
        [{ text: 'OK' }],
      );
      return;
    }

    const options = [
      'Ambil Foto',
      'Pilih dari Galeri',
      'Pilih Dokumen',
      'Batal',
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
        },
        buttonIndex => {
          if (buttonIndex !== 3) {
            handleAttachmentSelection(buttonIndex);
          }
        },
      );
    } else {
      // For Android, we'll use Alert for now
      Alert.alert('Pilih File', 'Pilih jenis file yang ingin dikirim', [
        { text: 'Ambil Foto', onPress: () => handleAttachmentSelection(0) },
        {
          text: 'Pilih dari Galeri',
          onPress: () => handleAttachmentSelection(1),
        },
        { text: 'Pilih Dokumen', onPress: () => handleAttachmentSelection(2) },
        { text: 'Batal', style: 'cancel' },
      ]);
    }
  };

  const handleAttachmentSelection = type => {
    // TODO: Implementasi file picker berdasarkan type
    // 0 = Camera, 1 = Gallery, 2 = Document
    switch (type) {
      case 0:
        Alert.alert('Info', 'Fitur kamera akan segera tersedia');
        break;
      case 1:
        Alert.alert('Info', 'Fitur galeri akan segera tersedia');
        break;
      case 2:
        Alert.alert('Info', 'Fitur dokumen akan segera tersedia');
        break;
    }
  };

  const handleTyping = () => {
    if (socket && currentUser && adminUser) {
      socket.emit('typing', {
        roomId: `user_${currentUser.id}_admin_${adminUser.id}`,
        userType: 'user',
        isTyping: true,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          roomId: `user_${currentUser.id}_admin_${adminUser.id}`,
          userType: 'user',
          isTyping: false,
        });
      }, 1000);
    }
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timeText,
              isMyMessage ? styles.myTimeText : styles.otherTimeText,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Memuat...</Text>
      </SafeAreaView>
    );
  }

  const BackIcon = () => (
    <Image
      source={require('./assets/back-icon.png')}
      style={{ width: 24, height: 24 }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Chat Content with Keyboard Avoiding */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Admin</Text>
            <Text style={styles.headerSubtitle}>Aktif 14 menit lalu</Text>
          </View>
        </View>

        {/* Conversation Status Info */}
        {!conversationStarted && messages.length === 0 && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💬 Menunggu admin memulai obrolan
            </Text>
            <Text style={styles.infoSubText}>
              Admin akan menghubungi Anda terkait pesanan yang telah dibayar
            </Text>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => {
            // Safe key generation with validation
            if (item.id) {
              return `msg-${item.id}`;
            }
            // Fallback for items without ID
            const timestamp = item.createdAt || Date.now();
            return `temp-${index}-${timestamp}`;
          }}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Memuat pesan...'
                  : 'Belum ada pesan. Harap tunggu admin!'}
              </Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Admin sedang mengetik...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          {/* Attachment Button */}
          <TouchableOpacity
            style={[
              styles.attachmentButton,
              !conversationStarted && styles.attachmentButtonDisabled,
            ]}
            onPress={handleFileAttachment}
            disabled={!conversationStarted}
          >
            <Text
              style={[
                styles.attachmentButtonText,
                !conversationStarted && styles.attachmentButtonTextDisabled,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              !conversationStarted && styles.textInputDisabled,
            ]}
            value={newMessage}
            onChangeText={text => {
              setNewMessage(text);
              handleTyping();
            }}
            placeholder={
              conversationStarted ? 'Ketik pesan...' : 'Menunggu admin ...'
            }
            multiline
            maxLength={500}
            editable={conversationStarted}
          />

          {/* Send Button with Icon */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || !conversationStarted) &&
                styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || !conversationStarted}
          >
            <Image
              source={require('./assets/send-icon.png')}
              style={[
                styles.sendIcon,
                (!newMessage.trim() || !conversationStarted) &&
                  styles.sendIconDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation - Completely Isolated */}
      <View style={styles.tabBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('Home')}
        >
          <Image
            source={require('./assets/beranda-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('CatalogScreen')}
        >
          <Image
            source={require('./assets/katalog-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtnActive}>
          <Image
            source={require('./assets/pesan-icon-active.png')}
            style={styles.tabIcon}
          />
          <Text style={styles.tabTextActive}>Pesan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation?.navigate('ProfileScreen')}
        >
          <Image
            source={require('./assets/profile-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    paddingBottom: 90, // Increased padding to accommodate bottom nav
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#000',
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: 'grey',
    fontSize: 14,
    opacity: 0.8,
  },
  infoContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  infoSubText: {
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
    color: '000',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: '000',
    fontSize: 16,
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: 2,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 2,
  },
  myMessageBubble: {
    backgroundColor: '#007bff',
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  timeText: {
    fontSize: 12,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#999',
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  typingText: {
    fontStyle: 'italic',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10, // Reduced margin
    zIndex: 100, // Lower than bottom nav but higher than messages
  },
  attachmentButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachmentButtonDisabled: {
    backgroundColor: '#fff',
  },
  attachmentButtonText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    color: 'grey',
    fontSize: 30,
  },
  attachmentButtonTextDisabled: {
    color: '#999',
  },
  textInput: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
    fontSize: 16,
  },
  textInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderColor: '#ccc',
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#fff',
  },
  sendIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
  },
  sendIconDisabled: {
    tintColor: '#999',
  },
  sendButtonText: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Bottom Navigation Styles
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 22,
    paddingBottom: 32,
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000, // Ensure it stays on top
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  tabBtnActive: {
    backgroundColor: '#E3F1FE',
    borderRadius: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 10,
  },
  tabIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tabTextActive: {
    fontFamily: FontFamily.outfit_medium,
    fontWeight: FontWeight.medium,
    fontSize: 15,
    color: '#0070D8',
  },
});
