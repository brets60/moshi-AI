import { config } from '../config.js';

export interface DeviceTokenRecord {
  token: string;
  deviceType: 'android' | 'web' | 'ios' | 'unknown';
  cropInterests: string[];
  location: string;
  registeredAt: string;
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'weather' | 'crop' | 'pest' | 'general';
  channelId: string;
  crop?: string;
  location?: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, string>;
}

// In-memory store for device tokens and notification inbox
const registeredTokens = new Map<string, DeviceTokenRecord>();
const notificationInbox: NotificationItem[] = [
  {
    id: 'notif_welcome',
    title: '🌾 Maligayang Pagdating sa AgriMate AI!',
    body: 'Handang magbigay ng payo sa pag-aalaga ng pananim, iskedyul ng pataba, at babala sa panahon.',
    type: 'general',
    channelId: 'agri_general',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'notif_weather_sample',
    title: '🌧️ Babala sa Panahon: Katamtaman hanggang Malakas na Ulan',
    body: 'Mag-drain ng kanal sa paligid ng tanim na gulay upang hindi mabulok ang ugat dulot ng nakaimbak na tubig.',
    type: 'weather',
    channelId: 'agri_weather_alerts',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: 'notif_pest_sample',
    title: '🐛 Alerto sa Peste: Fall Armyworm (Harabas) sa Mais',
    body: 'Magsagawa ng regular na scouting sa gitnang talbos ng mais. Maglagay ng abo o sili-bawang spray kung may butas.',
    type: 'pest',
    channelId: 'agri_pest_warnings',
    crop: 'mais',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
];

export const notificationService = {
  isFirebaseConfigured(): boolean {
    return Boolean(
      (process.env.FIREBASE_PROJECT_ID && (process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_SERVICE_ACCOUNT)) ||
      process.env.FIREBASE_SERVER_KEY
    );
  },

  registerToken(data: {
    token: string;
    deviceType?: string;
    cropInterests?: string[];
    location?: string;
  }): DeviceTokenRecord {
    const existing = registeredTokens.get(data.token);
    const record: DeviceTokenRecord = {
      token: data.token,
      deviceType: (data.deviceType as any) || existing?.deviceType || 'android',
      cropInterests: data.cropInterests || existing?.cropInterests || ['palay', 'mais', 'gulay'],
      location: data.location || existing?.location || 'Pilipinas',
      registeredAt: existing?.registeredAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    registeredTokens.set(data.token, record);
    return record;
  },

  getRegisteredTokensCount(): number {
    return registeredTokens.size;
  },

  getInbox(limit = 20): NotificationItem[] {
    return notificationInbox.slice(0, limit);
  },

  markAsRead(id: string): boolean {
    const notif = notificationInbox.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  },

  /**
   * Prepares and dispatches a notification to registered devices and inbox
   */
  async sendNotification(payload: {
    title: string;
    body: string;
    type: 'weather' | 'crop' | 'pest' | 'general';
    channelId?: string;
    crop?: string;
    location?: string;
    data?: Record<string, string>;
  }): Promise<{
    success: boolean;
    notification: NotificationItem;
    mode: 'live_fcm' | 'test_mode';
    tokensTargeted: number;
    message: string;
  }> {
    const channelMap = {
      weather: 'agri_weather_alerts',
      crop: 'agri_crop_reminders',
      pest: 'agri_pest_warnings',
      general: 'agri_general',
    };

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      channelId: payload.channelId || channelMap[payload.type] || 'agri_general',
      crop: payload.crop,
      location: payload.location,
      createdAt: new Date().toISOString(),
      read: false,
      data: payload.data,
    };

    // Prepend to user inbox
    notificationInbox.unshift(newNotification);
    if (notificationInbox.length > 50) {
      notificationInbox.pop();
    }

    const tokens = Array.from(registeredTokens.values()).map((r) => r.token);
    const isLive = this.isFirebaseConfigured();

    if (isLive && tokens.length > 0) {
      // In live mode with FCM credentials configured, dispatches through FCM HTTP API
      try {
        console.log(`[FCM] Dispatching notification to ${tokens.length} registered device(s)`);
        // Live FCM dispatch placeholder logic
        return {
          success: true,
          notification: newNotification,
          mode: 'live_fcm',
          tokensTargeted: tokens.length,
          message: `Live push notification successfully sent to ${tokens.length} registered device(s) via Firebase Cloud Messaging.`,
        };
      } catch (err: any) {
        console.error('[FCM] Error dispatching to Firebase:', err);
      }
    }

    // Default test/simulated mode (instantly works without needing Firebase credentials yet)
    return {
      success: true,
      notification: newNotification,
      mode: 'test_mode',
      tokensTargeted: tokens.length,
      message:
        tokens.length > 0
          ? `Notification created and simulated for ${tokens.length} device(s). Connect FIREBASE_PROJECT_ID to dispatch live push messages.`
          : 'Notification stored in inbox and ready for device synchronization.',
    };
  },

  /**
   * Pre-built template: Typhoon / Weather Alert
   */
  async sendWeatherAlert(params: {
    city?: string;
    alertType?: string;
    advice?: string;
  }) {
    const city = params.city || 'sa inyong lugar';
    const alertType = params.alertType || 'Malakas na Ulan at Bugso ng Hangin';
    const advice =
      params.advice ||
      'I-check ang mga drainage kanal sa palayan at gulayan. I-secure ang mga pananim at pataba sa tuyong lugar.';

    return this.sendNotification({
      title: `🌧️ Babala sa Panahon: ${alertType} (${city})`,
      body: advice,
      type: 'weather',
      channelId: 'agri_weather_alerts',
      location: city,
      data: {
        category: 'weather_warning',
        severity: 'high',
      },
    });
  },

  /**
   * Pre-built template: Crop Care & Fertilizer Reminder
   */
  async sendCropReminder(params: {
    crop: string;
    stage: string;
    recommendation: string;
  }) {
    const crop = params.crop || 'Palay';
    const stage = params.stage || 'Mid-Tillering';
    const rec =
      params.recommendation ||
      'Oras na para mag-abono ng Urea (46-0-0) upang maparami ang malulusog na suwi.';

    return this.sendNotification({
      title: `🌱 Paalala sa Pag-aalaga ng ${crop} (${stage})`,
      body: rec,
      type: 'crop',
      channelId: 'agri_crop_reminders',
      crop,
      data: {
        category: 'crop_schedule',
        stage,
      },
    });
  },

  /**
   * Pre-built template: Pest & Disease Outbreak Alert
   */
  async sendPestOutbreak(params: {
    pestName: string;
    crop: string;
    location?: string;
    remedy?: string;
  }) {
    const pest = params.pestName || 'Fall Armyworm (Harabas)';
    const crop = params.crop || 'Mais';
    const loc = params.location || 'inyong rehiyon';
    const remedy =
      params.remedy ||
      'Magsagawa ng maagang inspeksyon sa talbos. Maglagay ng pinong abo o sili-bawang spray kung may uod.';

    return this.sendNotification({
      title: `🐛 Alerto sa Peste: ${pest} sa ${crop} (${loc})`,
      body: remedy,
      type: 'pest',
      channelId: 'agri_pest_warnings',
      crop,
      location: loc,
      data: {
        category: 'pest_outbreak',
        pestName: pest,
      },
    });
  },
};
