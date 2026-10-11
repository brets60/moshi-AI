import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  style,
  textStyle,
  disabled,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = { ...styles.base };

    // Size
    if (size === 'sm') base = { ...base, paddingVertical: 8, paddingHorizontal: 12, minHeight: 38 };
    else if (size === 'lg') base = { ...base, paddingVertical: 16, paddingHorizontal: 24, minHeight: 56 };
    else base = { ...base, paddingVertical: 13, paddingHorizontal: 20, minHeight: 50 };

    // Variant
    if (variant === 'primary') {
      base.backgroundColor = disabled ? '#A5D6A7' : Colors.primary;
    } else if (variant === 'secondary') {
      base.backgroundColor = Colors.primarySurface;
    } else if (variant === 'outline') {
      base.backgroundColor = 'transparent';
      base.borderWidth = 1.5;
      base.borderColor = disabled ? '#C8D6CA' : Colors.primary;
    } else if (variant === 'danger') {
      base.backgroundColor = Colors.error;
    } else if (variant === 'ghost') {
      base.backgroundColor = 'transparent';
    }

    if (disabled && variant !== 'primary') {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { ...styles.text };

    if (size === 'sm') base.fontSize = 13;
    else if (size === 'lg') base.fontSize = 17;
    else base.fontSize = 15;

    if (variant === 'primary' || variant === 'danger') {
      base.color = Colors.white;
    } else if (variant === 'secondary' || variant === 'outline' || variant === 'ghost') {
      base.color = Colors.primary;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : {}, textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
