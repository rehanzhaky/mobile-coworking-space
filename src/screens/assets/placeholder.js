import React from 'react';
import { View, Text } from 'react-native';

// Placeholder component untuk menggantikan gambar yang belum ada
export const PlaceholderImage = ({ style, text = 'Image' }) => (
  <View
    style={[
      {
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
      },
      style,
    ]}
  >
    <Text style={{ color: '#757575', fontSize: 12 }}>{text}</Text>
  </View>
);

// Export default placeholder untuk require() calls
export default PlaceholderImage;
