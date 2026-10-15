import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notification display behavior for Expo Notifications
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  // Graceful fallback on web/standalone environments
}

export const notificationService = {
  /**
   * Checks if running inside the AgriMate Standalone Android APK
   */
  isNativeAndroid(): boolean {
    if (typeof window !== 'undefined' && (window as any).AgriAndroid) {
      return true;
    }
    return false;
  },

  /**
   * Requests notification permissions from Android or the browser
   */
  async requestPushPermission(): Promise<boolean> {
    try {
      // 1. If running in Android APK native bridge
      if (typeof window !== 'undefined' && (window as any).AgriAndroid) {
        (window as any).AgriAndroid.requestNotificationPermission();
        return true;
      }

      // 2. Browser Web Notifications API
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const result = await Notification.requestPermission();
        return result === 'granted';
      }

      // 3. Expo Notifications permission
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('Could not request notification permission:', err);
      return false;
    }
  },

  /**
   * Triggers a real 100% Free Native Android notification or browser push notification
   * without needing Firebase or any paid subscription!
   */
  triggerPushNotification(
    title: string,
    message: string,
    type: 'weather' | 'crop' | 'pest' | 'general' = 'general'
  ): void {
    try {
      // 1. Android APK Native Bridge (Zero cost, high priority, custom sound/vibration/channels)
      if (typeof window !== 'undefined' && (window as any).AgriAndroid) {
        (window as any).AgriAndroid.showNotification(title, message, type);
        return;
      }

      // 2. Standard Web Browser Notification API
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/icon.png',
            tag: `agrimate_${type}_${Date.now()}`,
          });
          return;
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              new Notification(title, {
                body: message,
                icon: '/icon.png',
                tag: `agrimate_${type}_${Date.now()}`,
              });
            }
          });
          return;
        }
      }

      // 3. Fallback: Expo Local Notification
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          sound: true,
        },
        trigger: null, // Send immediately
      }).catch((e) => console.log('Expo notification notice:', e));
    } catch (err) {
      console.warn('Could not trigger notification:', err);
    }
  },

  /**
   * Quick 1-Tap Test: Typhoon & Weather Warning
   */
  testWeatherNotification() {
    this.triggerPushNotification(
      '🌧️ Babala sa Panahon: Malakas na Pag-ulan',
      'May banta ng pagbaha at malakas na hangin. Mag-drain ng kanal sa palayan at gulayan upang maiwasan ang pagkabulok ng ugat.',
      'weather'
    );
  },

  /**
   * Quick 1-Tap Test: Fertilizer Schedule Reminder
   */
  testCropNotification() {
    this.triggerPushNotification(
      '🌾 Paalala sa Pag-aabono ng Palay (Tillering)',
      'Oras na para mag-topdress ng Urea (46-0-0) upang maparami ang mabubuting anak at suwi ng iyong palay. Tiyaking manipis ang tubig bago magsabog.',
      'crop'
    );
  },

  /**
   * Quick 1-Tap Test: Pest Outbreak Alert
   */
  testPestNotification() {
    this.triggerPushNotification(
      '🐛 Alerto sa Peste: Fall Armyworm (Harabas) sa Mais',
      'May uod na naitala sa karatig na bukirin. Magsagawa agad ng scouting sa talbos at maglagay ng abo o kakawate spray kung may butas.',
      'pest'
    );
  },

  async scheduleTaskReminder(task: {
    id: string;
    title: string;
    task_type: string;
    crop_name?: string;
    scheduled_at: string;
  }): Promise<string | null> {
    try {
      const scheduledDate = new Date(task.scheduled_at);
      const now = new Date();

      const diffSeconds = Math.floor((scheduledDate.getTime() - now.getTime()) / 1000);
      if (diffSeconds <= 0) {
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🌱 AgriMate Reminder: ${task.title}`,
          body: `${task.task_type} scheduled for ${task.crop_name || 'your crops'}.`,
          data: { taskId: task.id, scheduledAt: task.scheduled_at },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, diffSeconds),
          repeats: false,
        },
      });

      return identifier;
    } catch (err) {
      console.warn('Could not schedule local notification:', err);
      return null;
    }
  },

  async cancelReminder(notificationId: string): Promise<void> {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (err) {
      console.warn('Could not cancel notification:', err);
    }
  },

  async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
      console.warn('Could not cancel all notifications:', err);
    }
  },
};
