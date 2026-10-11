import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    let cardStyle: ViewStyle = { ...styles.base };

    if (variant === 'elevated') {
      cardStyle = {
        ...cardStyle,
        backgroundColor: Colors.white,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EDF2EE',
      };
    } else if (variant === 'outlined') {
      cardStyle = {
        ...cardStyle,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: Colors.border,
      };
    } else if (variant === 'flat') {
      cardStyle = {
        ...cardStyle,
        backgroundColor: '#F3F7F4',
      };
    }

    return cardStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[getCardStyle(), style]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
});
