import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import firebaseService, { testFirebase } from '../config/firebase_safe';

export default function FirebaseTestScreen({ navigation }) {
  const [testResult, setTestResult] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-run test when screen loads
    runFirebaseTest();
  }, []);

  const runFirebaseTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Running Firebase FCM Test...');

      const result = await testFirebase();
      setTestResult(result);
      setFcmToken(result.token);

      if (result.success && result.isReal) {
        Alert.alert(
          'Firebase Test SUCCESS! 🎉',
          `Firebase FCM is working with REAL configuration!\n\nProject: ${
            result.projectId
          }\nToken: ${result.token ? 'Received' : 'None'}`,
        );
      } else if (result.success && !result.isReal) {
        Alert.alert(
          'Firebase Test - Mock Mode ⚠️',
          'Firebase is working but still in mock mode. Real Firebase configuration might not be fully set up.',
        );
      } else {
        Alert.alert('Firebase Test FAILED ❌', `Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Test Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      await firebaseService.initialize();
      Alert.alert('Permission', 'Notification permission requested');
    } catch (error) {
      Alert.alert('Error', 'Failed to request permission: ' + error.message);
    }
  };

  const getStatusColor = isReal => {
    if (isReal) return '#00B69B'; // Green for real
    return '#FF9500'; // Orange for mock
  };

  const getStatusText = result => {
    if (!result) return 'Not tested';
    if (result.success && result.isReal) return 'REAL Firebase ✅';
    if (result.success && !result.isReal) return 'Mock Mode ⚠️';
    return 'Failed ❌';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Firebase FCM Test</Text>
        <Text style={styles.subtitle}>
          Test Firebase Cloud Messaging Configuration
        </Text>

        {/* Test Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text
            style={[
              styles.statusValue,
              {
                color: testResult ? getStatusColor(testResult.isReal) : '#666',
              },
            ]}
          >
            {getStatusText(testResult)}
          </Text>
        </View>

        {/* Project Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Project Information</Text>
          <Text style={styles.infoItem}>
            Project ID: co-working-space-48aa3
          </Text>
          <Text style={styles.infoItem}>
            App ID: 1:568073459500:android:dddc049dda6ac9c11e7e89
          </Text>
          <Text style={styles.infoItem}>Sender ID: 568073459500</Text>
        </View>

        {/* FCM Token */}
        {fcmToken && (
          <View style={styles.tokenCard}>
            <Text style={styles.tokenLabel}>FCM Token:</Text>
            <Text style={styles.tokenValue}>
              {fcmToken.length > 50
                ? fcmToken.substring(0, 50) + '...'
                : fcmToken}
            </Text>
            <Text style={styles.tokenType}>
              Type:{' '}
              {fcmToken.startsWith('mock_token_')
                ? 'Mock Token'
                : 'Real FCM Token'}
            </Text>
          </View>
        )}

        {/* Test Results */}
        {testResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <Text style={styles.resultItem}>
              Success: {testResult.success ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultItem}>
              Real Firebase: {testResult.isReal ? '✅' : '❌'}
            </Text>
            <Text style={styles.resultItem}>
              Token Received: {testResult.token ? '✅' : '❌'}
            </Text>
            {testResult.error && (
              <Text style={styles.errorText}>Error: {testResult.error}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={runFirebaseTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Run Firebase Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.permissionButton]}
          onPress={requestNotificationPermission}
        >
          <Text style={styles.buttonText}>Request Notification Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back to Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0070D8',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0070D8',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  tokenCard: {
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tokenType: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: '#f1f8e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 8,
  },
  resultItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '500',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#0070D8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: '#FF9500',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
