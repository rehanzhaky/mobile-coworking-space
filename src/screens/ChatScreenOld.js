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
} from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/ApiService';
} from 'react-native';
import { TextStyles, FontFamily, FontWeight } from '../styles/typography';

// Dummy data for messages
const initialMessages = [
  {
    id: '1',
    type: 'incoming',
    text: 'Berikut saya lampirkan',
    time: '10:11',
    file: {
      type: 'pdf',
      name: 'Lampiran.pdf',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
    },
  },
  {
    id: '2',
    type: 'outgoing',
    text: 'Y',
    time: '10:12',
    status: 'read',
  },
];

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  // Scroll to bottom on new message
  useEffect(() => {
    flatListRef?.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages(m => [
      ...m,
      {
        id: Date.now().toString(),
        type: 'outgoing',
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'sent',
      },
    ]);
    setInput('');
  };

  // Render each message bubble
  const renderMessage = ({ item }) => {
    if (item.type === 'incoming') {
      return (
        <View style={styles.incomingMsgWrapper}>
          <View style={styles.incomingBubble}>
            <Text style={styles.incomingText}>{item.text}</Text>
            {item.file && (
              <View style={styles.attachmentWrapper}>
                <Image
                  source={{ uri: item.file.icon }}
                  style={styles.fileIcon}
                />
                <Text style={styles.fileLabel}>PDF</Text>
              </View>
            )}
            <Text style={styles.msgTimeIncoming}>{item.time}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.outgoingMsgWrapper}>
          <View style={styles.outgoingBubble}>
            <Text style={styles.outgoingText}>{item.text}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <Text style={styles.msgTimeOutgoing}>{item.time}</Text>
              <Text style={styles.msgStatus}>✓✓</Text>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={require('./assets/back-icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>Admin</Text>
            <Text style={styles.status}>Aktif 14 menit lalu</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
            paddingBottom: 20,
          }}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusBtn}>
            <Text style={{ fontSize: 26, color: '#bbb' }}>+</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            placeholder="Ketik pesan"
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Image
              source={require('./assets/send-icon.png')}
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('./assets/beranda-icon-inactive.png')}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate('CatalogScreen')}
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
    backgroundColor: '#f7f7fb',
  },
  mainContent: {
    flex: 1,
    marginBottom: 85, // Space for bottom navigation
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  avatar: {
    marginLeft: 27,
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  username: {
    fontFamily: FontFamily.outfit_semibold,
    fontWeight: FontWeight.semibold,
    marginLeft: 16,
    fontSize: 20,
    color: '#000000',
  },
  status: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    marginLeft: 16,
    color: '#8573a1',
    fontSize: 15,
  },

  incomingMsgWrapper: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  incomingBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    padding: 10,
    maxWidth: '75%',
  },
  incomingText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 18,
    color: '#000000',
    marginBottom: 10,
  },
  attachmentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -6,
  },
  fileIcon: {
    width: 38,
    height: 38,
    marginRight: 7,
  },
  fileLabel: {
    fontSize: 17,
    color: '#eb3223',
    fontWeight: 'bold',
  },
  msgTimeIncoming: {
    fontSize: 15,
    color: '#c7c6cd',
    marginTop: 8,
  },

  outgoingMsgWrapper: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  outgoingBubble: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: '#1565C0',
    padding: 16,
    maxWidth: '70%',
  },
  outgoingText: {
    fontFamily: FontFamily.outfit_regular,
    fontWeight: FontWeight.regular,
    fontSize: 18,
    color: '#fff',
  },
  msgTimeOutgoing: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  msgStatus: {
    color: '#fff',
    fontSize: 14,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 3,
    marginBottom: 15,
  },
  plusBtn: {
    marginRight: 4,
  },
  chatInput: {
    flex: 1,
    fontSize: 18,
    marginHorizontal: 8,
    paddingVertical: 6,
    color: '#222',
  },
  sendBtn: {
    marginLeft: 6,
    padding: 8,
  },
  sendIcon: {
    width: 24,
    height: 24,
  },
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
