import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius } from '../../theme/colors';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'warning':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'error':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'info':
        return { bg: '#E3F2FD', text: '#1565C0' };
      case 'primary':
        return { bg: '#E8F5E9', text: '#1E5E3A' };
      default:
        return { bg: '#ECEFF1', text: '#455A64' };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
