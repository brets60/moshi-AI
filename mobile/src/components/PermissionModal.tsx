import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Camera, Image, MapPin, Bell, ShieldCheck } from 'lucide-react-native';
import {
  PermissionType,
  PERMISSION_EXPLANATIONS,
  permissionManager,
} from '../services/permissions';
import { Colors, BorderRadius, Spacing } from '../theme/colors';
import { Button } from './ui/Button';

interface PermissionModalProps {
  visible: boolean;
  type: PermissionType;
  onGranted: () => void;
  onDismiss: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  type,
  onGranted,
  onDismiss,
}) => {
  const explanation = PERMISSION_EXPLANATIONS[type] || {
    title: 'Permission Access',
    rationale: 'AgriMate AI needs access to enable this feature.',
    fallback: 'You can continue using other features normally.',
  };

  const getIcon = () => {
    switch (type) {
      case 'camera':
        return <Camera size={44} color={Colors.primary} />;
      case 'photos':
        return <Image size={44} color={Colors.primary} />;
      case 'location':
        return <MapPin size={44} color={Colors.primary} />;
      case 'notifications':
        return <Bell size={44} color={Colors.primary} />;
    }
  };

  const handleAllow = async () => {
    const result = await permissionManager.requestPermission(type);
    if (result.granted) {
      onGranted();
    } else {
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>{getIcon()}</View>

          <Text style={styles.title}>{explanation.title}</Text>
          <Text style={styles.rationale}>{explanation.rationale}</Text>

          <View style={styles.privacyBadge}>
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.privacyText}>
              Your data is private and only used for your farming records.
            </Text>
          </View>

          <View style={styles.fallbackBox}>
            <Text style={styles.fallbackLabel}>Alternative Option:</Text>
            <Text style={styles.fallbackText}>{explanation.fallback}</Text>
          </View>

          <Button
            title="Continue & Allow Access"
            variant="primary"
            size="lg"
            onPress={handleAllow}
            style={styles.allowButton}
          />

          <Button
            title="Not Now (Use Alternative)"
            variant="ghost"
            size="md"
            onPress={onDismiss}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  rationale: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F9F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  privacyText: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginLeft: 8,
    flex: 1,
  },
  fallbackBox: {
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#E8ECE9',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  fallbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fallbackText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  allowButton: {
    width: '100%',
    marginBottom: 8,
  },
});
