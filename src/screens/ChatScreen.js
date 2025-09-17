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
  RefreshControl,
  Linking,
  Dimensions,
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
  const [refreshing, setRefreshing] = useState(false);
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
      setLoading(true);
      console.log('🔄 Initializing chat...');
      
      // Get current user data with retry logic
      console.log('👤 Getting current user data...');
      const userData = await ApiService.getCurrentUser();
      
      if (!userData) {
        console.log('❌ No user data found');
        Alert.alert(
          'Session Expired', 
          'Sesi login Anda telah berakhir. Silakan login kembali.',
          [
            { 
              text: 'Login', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        return;
      }

      console.log('✅ User data retrieved:', {
        id: userData.id,
        username: userData.username,
        email: userData.email
      });
      
      setCurrentUser(userData);

      // Get admin user (assuming admin ID is 2)
      const admin = await getAdminUser();
      setAdminUser(admin);

      // Initialize socket connection
      // Try multiple URLs for Android emulator compatibility
      const socketUrls = Platform.OS === 'android' 
        ? ['http://10.0.2.2:5000', 'http://localhost:5000', 'http://127.0.0.1:5000']
        : ['http://localhost:5000'];
      
      console.log('🔌 Platform:', Platform.OS);
      console.log('🔌 Available socket URLs:', socketUrls);
      
      // Try first URL initially, fallback handled by socket.io
      const socketUrl = socketUrls[0];
      console.log('🔌 Connecting to socket server:', socketUrl);
      
      const newSocket = io(socketUrl, {
        forceNew: true,
        transports: ['polling', 'websocket'], // Use polling first for better emulator compatibility
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      setSocket(newSocket);

      // Handle socket events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to chat server with socket ID:', newSocket.id);
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
        Alert.alert('Connection Error', 'Cannot connect to chat server. Please check your connection.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Reconnect if server disconnected
          console.log('🔄 Attempting to reconnect...');
          newSocket.connect();
        }
      });

      newSocket.on('room_joined', data => {
        console.log('Joined room successfully:', data);
      });

      newSocket.on('receive_message', messageData => {
        console.log('📥 Received new message:', messageData);
        console.log('📥 Message from:', messageData.sender_type || messageData.senderType, '| To room:', messageData.room_id);
        console.log('📥 Current messages count before:', messages.length);
        
        setMessages(prev => {
          console.log('📥 Processing message for room:', messageData.room_id);
          console.log('📥 Message content:', messageData.message);
          
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
            console.log('📥 Replacing temporary message at index:', tempMsgIndex);
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
            console.log('📥 Message already exists, skipping...');
            return prev;
          }

          console.log('📥 Adding new message, new total count:', prev.length + 1);
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

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      // Load chat history and check conversation status
      if (userData && admin) {
        console.log('📖 🔄 FORCE LOADING CHAT HISTORY - User:', userData.id, 'Admin:', admin.id);
        
        // Force clear any existing messages first
        setMessages([]);
        console.log('📖 Cleared existing messages');
        
        await checkConversationStatus(userData.id, admin.id);
        await loadChatHistory(userData.id, admin.id);
        
        // Force another load after short delay to ensure we get latest data
        setTimeout(async () => {
          console.log('📖 🔄 SECONDARY FORCE LOAD after 2 seconds');
          await loadChatHistory(userData.id, admin.id);
        }, 2000);
      }
      
      console.log('✅ Chat initialization completed successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
      Alert.alert('Error', 'Gagal menginisialisasi chat');
    }
  };

  const getAdminUser = async () => {
    // Use the correct admin ID from database - ID 1 is the real admin
    return {
      id: 1,
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
        console.log('🔍 Message count:', data.messageCount);
        console.log('🔍 Admin first message exists:', data.adminFirstMessage);
        
        // Set conversation started if there are ANY messages, not just admin first
        const hasMessages = data.messageCount > 0;
        setConversationStarted(hasMessages);
        
        if (!hasMessages) {
          console.log('No messages found yet');
        } else {
          console.log('✅ Messages found, conversation available');
        }
      }
    } catch (error) {
      console.error('Error checking conversation status:', error);
      // Don't block conversation if there's an error
      setConversationStarted(true);
    }
  };

  const loadChatHistory = async (userId, adminId) => {
    try {
      setLoading(true);
      console.log('📖 Loading chat history for user', userId, 'and admin', adminId);
      
      const apiUrls = Platform.OS === 'android' 
        ? ['http://10.0.2.2:5000', 'http://localhost:5000', 'http://127.0.0.1:5000'] 
        : ['http://localhost:5000'];
      
      console.log('📖 Platform:', Platform.OS);
      console.log('📖 Available API URLs:', apiUrls);
      
      let response = null;
      let lastError = null;
      
      // Try each URL until one works
      for (const apiUrl of apiUrls) {
        try {
          console.log('📖 Trying to fetch from:', `${apiUrl}/api/chat/history/${userId}/${adminId}`);
          
          response = await fetch(
            `${apiUrl}/api/chat/history/${userId}/${adminId}`,
            { timeout: 5000 } // 5 second timeout
          );
          
          console.log('📖 Response from', apiUrl, '- Status:', response.status, 'OK:', response.ok);
          
          if (response.ok) {
            console.log('📖 ✅ Successfully connected to:', apiUrl);
            break; // Success, exit loop
          } else {
            console.log('📖 ❌ HTTP Error from', apiUrl, ':', response.status, response.statusText);
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            response = null;
          }
        } catch (error) {
          console.log('📖 ❌ Connection failed to', apiUrl, ':', error.message);
          lastError = error;
          response = null;
        }
      }
      
      if (!response) {
        console.error('📖 ❌ All API URLs failed. Last error:', lastError?.message);
        setLoading(false);
        return;
      }
      
      console.log('📖 Response status:', response.status);
      console.log('📖 Response OK:', response.ok);
      
      if (!response.ok) {
        console.error('📖 HTTP Error:', response.status, response.statusText);
        setLoading(false);
        return;
      }
      
      const data = await response.json();

      console.log('📖 Raw response data:', JSON.stringify(data, null, 2));

      if (data.success) {
        const chatMessages = data.chats || [];
        console.log('📖 Found', chatMessages.length, 'messages');
        
        // Log first few messages for debugging
        if (chatMessages.length > 0) {
          console.log('📖 First message sample:', JSON.stringify(chatMessages[0], null, 2));
          console.log('📖 Last message sample:', JSON.stringify(chatMessages[chatMessages.length - 1], null, 2));
        }
        
        setMessages(chatMessages);
        console.log('📖 Messages state updated with', chatMessages.length, 'items');
        
        // If we have messages, conversation is started
        if (chatMessages.length > 0) {
          setConversationStarted(true);
          console.log('📖 Conversation marked as started');
        }
      } else {
        console.log('📖 Failed to load chat history:', data.error);
        console.log('📖 Full error response:', JSON.stringify(data, null, 2));
      }
      setLoading(false);
    } catch (error) {
      console.error('📖 Error loading chat history:', error);
      console.error('📖 Error message:', error.message);
      console.error('📖 Error stack:', error.stack);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!currentUser || !adminUser) return;
    
    setRefreshing(true);
    console.log('📖 🔄 MANUAL REFRESH - Reloading chat history...');
    
    try {
      // Clear current messages
      setMessages([]);
      
      // Force reload chat history
      await loadChatHistory(currentUser.id, adminUser.id);
      
      console.log('📖 ✅ Manual refresh completed');
    } catch (error) {
      console.error('📖 ❌ Manual refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = () => {
    // Allow sending messages anytime - no conversation restriction

    if (newMessage.trim() && socket && currentUser && adminUser) {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`;
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

      console.log('📤 Sending message:', messageData);
      console.log('📤 Socket connected:', socket?.connected);
      console.log('📤 Current user:', currentUser?.id);
      console.log('📤 Admin user:', adminUser?.id);
      
      if (socket?.connected) {
        socket.emit('send_message', messageData);
        console.log('📤 Message sent via socket successfully');
      } else {
        console.error('📤 Socket not connected, cannot send message');
        Alert.alert('Connection Error', 'Not connected to chat server. Please try again.');
      }
      
      setNewMessage('');
    }
  };

  const handleFileAttachment = () => {
    // Allow file attachment anytime - no conversation restriction

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

  // Function to check if message is a file/image
  const isFileMessage = (message) => {
    if (!message || !message.message) return false;
    return message.messageType === 'file' ||
           (typeof message.message === 'string' &&
            (message.message.startsWith('/uploads/') ||
             message.message.includes('/uploads/chat/')));
  };

  // Function to get file URL
  const getFileUrl = (message) => {
    if (!message || !message.message) return '';
    const baseUrl = 'http://10.0.2.2:5000'; // Backend URL
    if (message.message.startsWith('http')) {
      return message.message;
    }
    return `${baseUrl}${message.message}`;
  };

  // Function to check if file is an image
  const isImageFile = (message) => {
    if (!message) return false;
    const fileName = message.fileName || message.message || '';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext =>
      fileName.toLowerCase().includes(ext)
    ) || (message.fileType && message.fileType.startsWith('image/'));
  };

  // Function to get file name from path
  const getFileName = (message) => {
    if (!message) return 'File';
    if (message.fileName) {
      return message.fileName;
    }
    const path = message.message || '';
    return path.split('/').pop() || 'File';
  };

  // Function to open file
  const openFile = (fileUrl) => {
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Tidak dapat membuka file');
    });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === currentUser?.id;
    const isAdminMessage = item.userType === 'admin' || item.senderId === 2;
    const isFile = isFileMessage(item);

    // Debug log
    console.log('Message:', item.message, 'senderId:', item.senderId, 'currentUserId:', currentUser?.id, 'isMyMessage:', isMyMessage, 'isFile:', isFile);

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
          {isFile ? (
            // Render file/image message
            <View style={styles.fileMessageContainer}>
              {isImageFile(item) ? (
                // Render image
                <TouchableOpacity
                  onPress={() => openFile(getFileUrl(item))}
                  style={styles.imageContainer}
                >
                  <Image
                    source={{ uri: getFileUrl(item) }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                  <Text style={[
                    styles.fileNameText,
                    isMyMessage ? styles.myFileNameText : styles.otherFileNameText
                  ]}>
                    {getFileName(item)}
                  </Text>
                </TouchableOpacity>
              ) : (
                // Render file
                <TouchableOpacity
                  onPress={() => openFile(getFileUrl(item))}
                  style={[
                    styles.fileContainer,
                    isMyMessage ? styles.myFileContainer : styles.otherFileContainer
                  ]}
                >
                  <View style={styles.fileIcon}>
                    <Text style={styles.fileIconText}>📄</Text>
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={[
                      styles.fileNameText,
                      isMyMessage ? styles.myFileNameText : styles.otherFileNameText
                    ]}>
                      {getFileName(item)}
                    </Text>
                    <Text style={[
                      styles.fileActionText,
                      isMyMessage ? styles.myFileActionText : styles.otherFileActionText
                    ]}>
                      Tap untuk membuka
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Render text message
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.message}
            </Text>
          )}

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

  // Show loading screen while initializing
  if (loading && !currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {/* Conversation Status Info - Only show if really no messages */}
        {messages.length === 0 && !loading && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💬 Menunggu pesan
            </Text>
            <Text style={styles.infoSubText}>
              Pesan dari admin akan muncul di sini
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              title="Menyegarkan chat..."
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Memuat pesan...'
                  : 'Tidak ada pesan'}
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
            ]}
            onPress={handleFileAttachment}
            disabled={false}
          >
            <Text
              style={[
                styles.attachmentButtonText,
              ]}
            >
              +
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
            ]}
            value={newMessage}
            onChangeText={text => {
              setNewMessage(text);
              handleTyping();
            }}
            placeholder="Ketik pesan..."
            multiline
            maxLength={500}
            editable={true}
          />

          {/* Send Button with Icon */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Image
              source={require('./assets/send-icon.png')}
              style={[
                styles.sendIcon,
                !newMessage.trim() && styles.sendIconDisabled,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: FontFamily.outfit_regular,
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
  // File and Image Message Styles
  fileMessageContainer: {
    marginBottom: 4,
  },
  imageContainer: {
    alignItems: 'center',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 150,
  },
  myFileContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  otherFileContainer: {
    backgroundColor: '#f0f0f0',
  },
  fileIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  myFileNameText: {
    color: 'white',
  },
  otherFileNameText: {
    color: '#333',
  },
  fileActionText: {
    fontSize: 12,
    opacity: 0.7,
  },
  myFileActionText: {
    color: 'white',
  },
  otherFileActionText: {
    color: '#666',
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
