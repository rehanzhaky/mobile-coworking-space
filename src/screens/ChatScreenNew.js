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
  Linking,
  Dimensions,
} from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';

export default function ChatScreen({ navigation }) {
  // State untuk socket dan chat
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const socketUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5000' 
        : 'http://localhost:5000';
      const newSocket = io(socketUrl, {
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
        newSocket.emit('join_room', roomData);
      });

      newSocket.on('receive_message', messageData => {
        console.log('Received message:', messageData);
        setMessages(prev => [...prev, messageData]);
      });

      newSocket.on('user_typing', data => {
        if (data.userType === 'admin') {
          setIsTyping(data.isTyping);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      // Load chat history
      if (userData && admin) {
        await loadChatHistory(userData.id, admin.id);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Gagal menginisialisasi chat');
    }
  };

  const getAdminUser = async () => {
    // For simplicity, we'll use a fixed admin ID
    // In production, you might want to get this from an API
    return {
      id: 1,
      firstName: 'Administrator',
      lastName: 'PKBI Kepri',
      email: 'pkbikepri@pkbi.or.id',
      isAdmin: true,
    };
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
        setMessages(data.chats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && currentUser && adminUser) {
      const messageData = {
        senderId: currentUser.id,
        receiverId: adminUser.id,
        message: newMessage.trim(),
        userType: 'user',
      };

      socket.emit('send_message', messageData);
      setNewMessage('');
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
    return message.messageType === 'file' ||
           (typeof message.message === 'string' &&
            (message.message.startsWith('/uploads/') ||
             message.message.includes('/uploads/chat/')));
  };

  // Function to get file URL
  const getFileUrl = (message) => {
    const baseUrl = 'http://10.0.2.2:5000'; // Backend URL
    if (message.message.startsWith('http')) {
      return message.message;
    }
    return `${baseUrl}${message.message}`;
  };

  // Function to check if file is an image
  const isImageFile = (message) => {
    const fileName = message.fileName || message.message;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext =>
      fileName.toLowerCase().includes(ext)
    ) || (message.fileType && message.fileType.startsWith('image/'));
  };

  // Function to get file name from path
  const getFileName = (message) => {
    if (message.fileName) {
      return message.fileName;
    }
    const path = message.message;
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
    const isFile = isFileMessage(item);

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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Admin PKBI Kepri</Text>
            <Text style={styles.headerSubtitle}>Customer Service</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          style={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Memuat pesan...'
                  : 'Belum ada pesan. Mulai percakapan!'}
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
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={text => {
              setNewMessage(text);
              handleTyping();
            }}
            placeholder="Ketik pesan..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Kirim</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
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
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
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
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
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
});
