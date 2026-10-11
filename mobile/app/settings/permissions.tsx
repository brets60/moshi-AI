import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  MapPin,
  Bell,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react-native';
import {
  permissionManager,
  PermissionType,
  PERMISSION_EXPLANATIONS,
} from '../../src/services/permissions';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

export default function PermissionCenterScreen() {
  const [statuses, setStatuses] = useState<Record<PermissionType, string>>({
    camera: 'undetermined',
    photos: 'undetermined',
    location: 'undetermined',
    notifications: 'undetermined',
  });

  useEffect(() => {
    checkAllStatuses();
  }, []);

  const checkAllStatuses = async () => {
    const [cam, pic, loc, notif] = await Promise.all([
      permissionManager.getStatus('camera'),
      permissionManager.getStatus('photos'),
      permissionManager.getStatus('location'),
      permissionManager.getStatus('notifications'),
    ]);

    setStatuses({
      camera: cam,
      photos: pic,
      location: loc,
      notifications: notif,
    });
  };

  const handleRequest = async (type: PermissionType) => {
    const res = await permissionManager.requestPermission(type);
    setStatuses((prev) => ({ ...prev, [type]: res.status }));
  };

  const renderPermissionItem = (
    type: PermissionType,
    title: string,
    icon: React.ReactNode
  ) => {
    const status = statuses[type];
    const info = PERMISSION_EXPLANATIONS[type];
    const isGranted = status === 'granted';

    return (
      <Card key={type} style={styles.permCard}>
        <View style={styles.permHeader}>
          <View style={styles.iconCircle}>{icon}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>{title}</Text>
            <View style={styles.statusRow}>
              {isGranted ? (
                <CheckCircle2 size={14} color={Colors.success} style={{ marginRight: 4 }} />
              ) : (
                <XCircle size={14} color={Colors.warning} style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.statusText,
                  { color: isGranted ? Colors.success : Colors.warning },
                ]}
              >
                {isGranted ? 'Permission Granted' : 'Access Not Granted'}
              </Text>
            </View>
          </View>

          {!isGranted && (
            <Button
              title="Grant Access"
              variant="outline"
              size="sm"
              onPress={() => handleRequest(type)}
            />
          )}
        </View>

        <Text style={styles.rationaleText}>{info.rationale}</Text>

        <View style={styles.fallbackBox}>
          <Text style={styles.fallbackLabel}>If Disabled / Alternative:</Text>
          <Text style={styles.fallbackText}>{info.fallback}</Text>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.introBox}>
        <ShieldCheck size={28} color={Colors.primary} style={{ marginBottom: 6 }} />
        <Text style={styles.introTitle}>Privacy & Phone Permissions</Text>
        <Text style={styles.introDesc}>
          AgriMate never asks for all permissions at once. You can review why each access is requested and know that the app remains fully functional even with permissions denied.
        </Text>
      </View>

      {renderPermissionItem('camera', 'Camera Access', <Camera size={22} color={Colors.primary} />)}
      {renderPermissionItem('photos', 'Photo Library', <ImageIcon size={22} color="#1565C0" />)}
      {renderPermissionItem('location', 'Farm Location', <MapPin size={22} color="#FB8C00" />)}
      {renderPermissionItem('notifications', 'Reminders & Notifications', <Bell size={22} color="#8E24AA" />)}

      <Card style={styles.systemSettingsCard}>
        <Text style={styles.systemSettingsTitle}>Device System Settings</Text>
        <Text style={styles.systemSettingsDesc}>
          If you previously selected "Don't ask again" or revoked permissions in system settings, you can open your phone's operating system settings directly:
        </Text>
        <Button
          title="Open Device System Settings"
          variant="primary"
          size="md"
          icon={<ExternalLink size={16} color={Colors.white} />}
          onPress={() => permissionManager.openSystemSettings()}
          style={{ marginTop: 12 }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  introBox: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  introDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 320,
  },
  permCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  permHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  permTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rationaleText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginVertical: 6,
  },
  fallbackBox: {
    backgroundColor: '#F7FAF8',
    borderRadius: BorderRadius.md,
    padding: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.textSecondary,
  },
  fallbackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fallbackText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  systemSettingsCard: {
    padding: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: '#E8F5E9',
  },
  systemSettingsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  systemSettingsDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
});
