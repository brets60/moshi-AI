import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CROPS: '@agrimate:crops',
  TASKS: '@agrimate:tasks',
  WEATHER: '@agrimate:weather',
  ANALYSES: '@agrimate:analyses',
  PROFILE: '@agrimate:profile',
  SETTINGS: '@agrimate:settings',
  SYNC_QUEUE: '@agrimate:sync_queue',
  AUTH_SESSION: '@agrimate:auth_session',
  PERMISSION_STATE: '@agrimate:permissions',
};

// Initial offline fallback crops for new users or offline demonstrations
export const DEFAULT_OFFLINE_CROPS = [
  {
    id: 'crop_demo_1',
    user_id: 'local_user',
    crop_name: 'Roma Tomatoes',
    variety: 'San Marzano',
    planting_date: '2026-03-01',
    expected_harvest_date: '2026-07-15',
    plot_size: 1.0,
    plot_size_unit: 'acres',
    growth_stage: 'Vegetative',
    status: 'Active',
    notes: 'Mulched with rice straw. Drip lines checked.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'crop_demo_2',
    user_id: 'local_user',
    crop_name: 'Sweet Corn',
    variety: 'Golden Bantam',
    planting_date: '2026-02-15',
    expected_harvest_date: '2026-06-20',
    plot_size: 2.5,
    plot_size_unit: 'acres',
    growth_stage: 'Flowering',
    status: 'Active',
    notes: 'Tassels beginning to appear.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_OFFLINE_TASKS = [
  {
    id: 'task_demo_1',
    user_id: 'local_user',
    crop_id: 'crop_demo_1',
    crop_name: 'Roma Tomatoes',
    title: 'Morning Drip Irrigation',
    description: 'Irrigate for 30 minutes at 7:00 AM before sun peak.',
    task_type: 'Watering',
    priority: 'High',
    scheduled_at: new Date().toISOString(),
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_demo_2',
    user_id: 'local_user',
    crop_id: 'crop_demo_1',
    crop_name: 'Roma Tomatoes',
    title: 'Inspect leaf undersides for hornworms',
    description: 'Check outer foliage and prune any yellowing bottom leaves.',
    task_type: 'Pest inspection',
    priority: 'Medium',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_demo_3',
    user_id: 'local_user',
    crop_id: 'crop_demo_2',
    crop_name: 'Sweet Corn',
    title: 'Apply organic compost side-dressing',
    description: 'Add 1 shovel of aged compost along row base.',
    task_type: 'Fertilizing',
    priority: 'Medium',
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    status: 'Pending',
    created_at: new Date().toISOString(),
  },
];

export const offlineStorage = {
  // Crops
  async getCrops(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CROPS);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(DEFAULT_OFFLINE_CROPS));
        return DEFAULT_OFFLINE_CROPS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_OFFLINE_CROPS;
    }
  },

  async saveCrops(crops: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
    } catch (e) {
      console.warn('Failed to save crops locally:', e);
    }
  },

  // Tasks
  async getTasks(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_OFFLINE_TASKS));
        return DEFAULT_OFFLINE_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_OFFLINE_TASKS;
    }
  },

  async saveTasks(tasks: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks locally:', e);
    }
  },

  // Weather Cache
  async getWeather(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveWeather(weather: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (e) {
      console.warn('Failed to save weather locally:', e);
    }
  },

  // Analyses
  async getAnalyses(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ANALYSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveAnalysis(analysis: any): Promise<void> {
    try {
      const current = await this.getAnalyses();
      const updated = [analysis, ...current.filter((a) => a.id !== analysis.id)];
      await AsyncStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save analysis locally:', e);
    }
  },

  // User Profile
  async getProfile(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile locally:', e);
    }
  },

  // Sync Queue for Offline Mutations
  async enqueueSyncMutation(mutation: { type: string; payload: any; timestamp: string }): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push(mutation);
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to queue mutation:', e);
    }
  },

  async getSyncQueue(): Promise<any[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (e) {
      console.warn('Failed to clear sync queue:', e);
    }
  },

  // Permissions state
  async getPermissions(): Promise<Record<string, string>> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSION_STATE);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  async savePermission(name: string, status: string): Promise<void> {
    try {
      const current = await this.getPermissions();
      current[name] = status;
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATE, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save permission state:', e);
    }
  },
};
