import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { offlineStorage } from './offlineStorage';

export type PermissionType = 'camera' | 'photos' | 'location' | 'notifications';

export interface PermissionDetail {
  id: PermissionType;
  title: string;
  iconName: string;
  purpose: string;
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
  fallbackDescription: string;
  isOptional: boolean;
}

export const PERMISSION_EXPLANATIONS: Record<PermissionType, { title: string; rationale: string; fallback: string }> = {
  camera: {
    title: 'Camera Access',
    rationale:
      'AgriMate AI uses your camera to photograph diseased leaves, pest infestations, and crop damage for instant diagnostic analysis.',
    fallback:
      'If you prefer not to grant camera access, you can choose an existing photo from your photo library or manually describe symptoms to the AI assistant.',
  },
  photos: {
    title: 'Photo Library Access',
    rationale:
      'Allows you to select previously taken photos of your crops from your gallery to upload for plant doctor diagnosis.',
    fallback:
      'You can use the camera directly to snap a photo in real-time, or type symptoms into the AI Chat.',
  },
  location: {
    title: 'Location Access',
    rationale:
      'AgriMate AI requests your approximate location to provide accurate local weather forecasts, rain alerts, and region-specific growing tips.',
    fallback:
      'You can decline GPS access anytime and manually select your farm city or region from our search menu.',
  },
  notifications: {
    title: 'Notification Access',
    rationale:
      'AgriMate AI sends helpful, timely reminders for your scheduled watering routines, fertilizer treatments, and harvest deadlines.',
    fallback:
      'You can review all upcoming tasks on your Farming Planner dashboard inside the app whenever you open it.',
  },
};

export const permissionManager = {
  async getStatus(type: PermissionType): Promise<'granted' | 'denied' | 'undetermined' | 'blocked'> {
    try {
      if (type === 'camera') {
        const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
        if (status === 'granted') return 'granted';
        if (!canAskAgain) return 'blocked';
        return status === 'denied' ? 'denied' : 'undetermined';
      }

      if (type === 'photos') {
        const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (status === 'granted') return 'granted';
        if (!canAskAgain) return 'blocked';
        return status === 'denied' ? 'denied' : 'undetermined';
      }

      if (type === 'location') {
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') return 'granted';
        if (!canAskAgain) return 'blocked';
        return status === 'denied' ? 'denied' : 'undetermined';
      }

      if (type === 'notifications') {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        if (status === 'granted') return 'granted';
        if (!canAskAgain) return 'blocked';
        return status === 'denied' ? 'denied' : 'undetermined';
      }

      return 'undetermined';
    } catch {
      // Mock status from offline cache if native module is not ready in simulator
      const saved = await offlineStorage.getPermissions();
      return (saved[type] as any) || 'undetermined';
    }
  },

  async requestPermission(type: PermissionType): Promise<{ granted: boolean; status: string }> {
    try {
      let granted = false;
      let statusStr = 'denied';

      if (type === 'camera') {
        const res = await ImagePicker.requestCameraPermissionsAsync();
        granted = res.status === 'granted';
        statusStr = res.status;
      } else if (type === 'photos') {
        const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
        granted = res.status === 'granted';
        statusStr = res.status;
      } else if (type === 'location') {
        const res = await Location.requestForegroundPermissionsAsync();
        granted = res.status === 'granted';
        statusStr = res.status;
      } else if (type === 'notifications') {
        const res = await Notifications.requestPermissionsAsync();
        granted = res.status === 'granted';
        statusStr = res.status;
      }

      await offlineStorage.savePermission(type, statusStr);
      return { granted, status: statusStr };
    } catch (err) {
      console.warn(`Permission request for ${type} failed, using graceful fallback:`, err);
      // In simulator / test mode, allow graceful toggle
      await offlineStorage.savePermission(type, 'granted');
      return { granted: true, status: 'granted' };
    }
  },

  openSystemSettings() {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  },
};
