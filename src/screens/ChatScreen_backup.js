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
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

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

      console.log('👤 Current user data:', userData);
      console.log('🆔 User ID:', userData.id, 'Type:', typeof userData.id);
      
      // Ensure user ID is numeric for socket compatibility
      if (typeof userData.id !== 'number') {
        console.log('🔧 Converting user ID to number for socket compatibility');
        userData.id = parseInt(userData.id) || 1;
      }
      
      setCurrentUser(userData);

      // Get admin user (assuming admin ID is 2)
      const admin = await getAdminUser();
      console.log('👨‍💼 Admin user data:', admin);
      console.log('🆔 Admin ID:', admin.id, 'Type:', typeof admin.id);
      
      setAdminUser(admin);

      // Initialize socket connection
      const socketUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000'
        : 'http://localhost:5000';
        
      console.log(`🔌 Connecting to socket server: ${socketUrl}`);
      setConnectionStatus(`Connecting...`);
      
      const newSocket = io(socketUrl, {
        forceNew: true,
        transports: ['polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      });

      setSocket(newSocket);

      // Handle socket events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to chat server with socket ID:', newSocket.id);
        setConnectionStatus('Connected');
        
        // Join room
        const roomData = {
          userId: userData.id,
          adminId: admin.id,
          userType: 'user',
        };
        console.log('📨 Joining room with data:', roomData);
        console.log('📍 Expected room ID:', `user_${userData.id}_admin_${admin.id}`);
        newSocket.emit('join_room', roomData);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnectionStatus('Connection Failed');
        
        // Show user-friendly error
        Alert.alert(
          'Connection Error', 
          'Unable to connect to chat server. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: () => {
              setConnectionStatus('Reconnecting...');
              newSocket.connect();
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setConnectionStatus('Disconnected');
      });

      newSocket.on('room_joined', data => {
        console.log('✅ Joined room successfully:', data);
        setConnectionStatus('Ready for chat');
      });

      newSocket.on('receive_message', messageData => {
        console.log('📩 Received message from server:', messageData);
        setMessages(prev => [...prev, messageData]);
      });

      newSocket.on('conversation_started', data => {
        console.log('Conversation started by admin:', data);
        setConversationStarted(true);
        // Removed Alert popup - notification will only appear in notification page
      });

      newSocket.on('user_typing', data => {
        if (data.userType === 'admin') {
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('message_error', (error) => {
        console.error('❌ Message error:', error);
        Alert.alert('Error', 'Gagal mengirim atau menerima pesan');
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

      console.log('👤 Current user data:', userData);
      console.log('🆔 User ID:', userData.id, 'Type:', typeof userData.id);
      
      // Ensure user ID is numeric for socket compatibility
      if (typeof userData.id !== 'number') {
        console.log('🔧 Converting user ID to number for socket compatibility');
        userData.id = parseInt(userData.id) || 1;
      }
      
      setCurrentUser(userData);

      // Get admin user (assuming admin ID is 2)
      const admin = await getAdminUser();
      console.log('👨‍💼 Admin user data:', admin);
      console.log('🆔 Admin ID:', admin.id, 'Type:', typeof admin.id);
      
      setAdminUser(admin);

      // Initialize socket connection
      // Based on testing, localhost works for your emulator setup
      const socketUrl = Platform.OS === 'android' 
        ? 'http://localhost:5000'  // Changed from 10.0.2.2 to localhost
        : 'http://localhost:5000';
        
      console.log(`� Connecting to socket server: ${socketUrl}`);
      setConnectionStatus(`Connecting to ${socketUrl}...`);
      
      const newSocket = io(socketUrl, {
        forceNew: true,
        transports: ['polling', 'websocket'], // Try polling first for emulator compatibility
        timeout: 15000, // Increased timeout for polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      // Handle socket events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to chat server with socket ID:', newSocket.id);
        setConnectionStatus('Connected');
        
        // Join room
        const roomData = {
          userId: userData.id,
          adminId: admin.id,
          userType: 'user',
        };
        console.log('📨 Joining room with data:', roomData);
        console.log('📍 Expected room ID:', `user_${userData.id}_admin_${admin.id}`);
        newSocket.emit('join_room', roomData);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setConnectionStatus('Connection Failed');
        
        // Show user-friendly error
        Alert.alert(
          'Connection Error',
          'Unable to connect to chat server. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: () => {
              setConnectionStatus('Reconnecting...');
              newSocket.connect();
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setConnectionStatus('Disconnected');
        
        if (reason === 'io server disconnect') {
          // Reconnect if server disconnected
          console.log('🔄 Attempting to reconnect...');
          setConnectionStatus('Reconnecting...');
          newSocket.connect();
        }
      });

      newSocket.on('room_joined', data => {
        console.log('✅ Joined room successfully:', data);
        console.log('📍 Mobile app is now listening in room:', data.roomId);
        setConnectionStatus('Ready for chat');
      });

      newSocket.on('receive_message', messageData => {
        console.log('📩 Received message from server:', messageData);
        console.log('📍 Message room ID:', messageData.roomId);
        console.log('👤 Message sender ID:', messageData.senderId);
        console.log('💬 Message content:', messageData.message);
        
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
        // Removed Alert popup - notification will only appear in notification page
      });

      newSocket.on('user_typing', data => {
        if (data.userType === 'admin') {
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('message_error', (error) => {
        console.error('❌ Message error:', error);
        Alert.alert('Error', 'Gagal mengirim atau menerima pesan');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Reconnect if server disconnected
          console.log('🔄 Attempting to reconnect...');
          newSocket.connect();
        }
      });

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
      const apiUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000' 
        : 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/chat/conversation-status/${userId}/${adminId}`,
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
      
      const apiUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000' 
        : 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/chat/history/${userId}/${adminId}`,
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.chats || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat history:', error);
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

      console.log('📤 Sending message from mobile:', messageData);
      console.log('📍 Expected room ID for message:', `user_${currentUser.id}_admin_${adminUser.id}`);
      console.log('👤 Current user ID:', currentUser.id);
      console.log('👨‍💼 Admin user ID:', adminUser.id);
      
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
    const isAdminMessage = item.userType === 'admin' || item.senderId === 2;
    
    // Debug log
    console.log('Message:', item.message, 'senderId:', item.senderId, 'currentUserId:', currentUser?.id, 'isMyMessage:', isMyMessage);

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
          
          <View style={[
            styles.timeContainer,
            isMyMessage ? styles.myTimeContainer : styles.otherTimeContainer
          ]}>
            <Text
              style={[
                styles.timeText,
                isMyMessage ? styles.myTimeText : styles.otherTimeText,
              ]}
            >
              {formatTime(item.createdAt)}
            </Text>
            
            {/* Check icons for user messages (messages sent by current user) */}
            {isMyMessage && (
              <View style={styles.checkIcons}>
                <Image 
                  source={require('./assets/check-success.png')} 
                  style={[styles.checkIcon, styles.checkIconBack]}
                />
                <Image 
                  source={require('./assets/check-success.png')} 
                  style={[styles.checkIcon, styles.checkIconFront]}
                />
              </View>
            )}
          </View>
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
            <Text style={styles.headerSubtitle}>{connectionStatus}</Text>
          </View>
          
          {/* Debug button - remove in production */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={() => {
                console.log('🧪 Debug: Current socket state:', socket?.connected);
                console.log('🧪 Debug: Current user:', currentUser);
                console.log('🧪 Debug: Admin user:', adminUser);
                Alert.alert('Debug Info', `Socket: ${socket?.connected ? 'Connected' : 'Disconnected'}\nUser ID: ${currentUser?.id}\nAdmin ID: ${adminUser?.id}`);
              }}
              style={{padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4}}
            >
              <Text style={{fontSize: 10}}>Debug</Text>
            </TouchableOpacity>
          )}
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
    marginLeft: 50,
  },
  otherMessage: {
    alignItems: 'flex-start',
    marginRight: 50,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    marginVertical: 2,
    position: 'relative',
  },
  myMessageBubble: {
    backgroundColor: '#1565C0',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myTimeContainer: {
    justifyContent: 'space-between',
  },
  otherTimeContainer: {
    justifyContent: 'flex-end',
  },
  timeText: {
    fontSize: 12,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 0,
  },
  otherTimeText: {
    color: '#999',
  },
  checkIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: 15, // Reduced width to accommodate overlap
  },
  checkIcon: {
    width: 10,
    height: 14,
    tintColor: '#fff',
  },
  checkIconBack: {
    position: 'absolute',
    right: 0,
  },
  checkIconFront: {
    position: 'absolute',
    right: 5, // Overlap by positioning 5px to the left
    zIndex: 1,
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
