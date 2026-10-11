import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
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
        return null; // Don't schedule past dates
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
