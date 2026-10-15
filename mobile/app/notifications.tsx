import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { Bell, Droplets, Sprout, Calendar, CloudRain, Bug, ShieldCheck, Zap, Clock } from 'lucide-react-native';
import { notificationService } from '../src/services/notifications';
import { permissionManager } from '../src/services/permissions';
import { api } from '../src/services/api';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [fertilizerReminders, setFertilizerReminders] = useState(true);
  const [pestWarnings, setPestWarnings] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [lastTested, setLastTested] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await api.getTasks('upcoming');
      setTasks(data || []);
    } catch (e) {
      console.warn('Failed to load upcoming tasks:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleToggleMaster = async (val: boolean) => {
    setEnabled(val);
    if (!val) {
      await notificationService.cancelAllReminders();
      Alert.alert('Naka-off ang Notifications', 'Pansamantalang pinatigil ang mga paalala sa telepono.');
    } else {
      const granted = await notificationService.requestPushPermission();
      if (granted) {
        Alert.alert('Aktibo ang Notifications', 'Makakatanggap ka na ng mga babala sa panahon, peste, at paalala sa pataba.');
      }
    }
  };

  const handleTestWeather = () => {
    notificationService.testWeatherNotification();
    setLastTested('🌧️ Babala sa Bagyo at Ulan');
  };

  const handleTestCrop = () => {
    notificationService.testCropNotification();
    setLastTested('🌾 Paalala sa Pag-aabono');
  };

  const handleTestPest = () => {
    notificationService.testPestNotification();
    setLastTested('🐛 Alerto sa Peste');
  };

  const handleTestBackground = () => {
    notificationService.testBackgroundNotification(10);
    setLastTested('⏰ Background Alarm (Tutunog sa loob ng 10 segundo - maaari mo nang isara ang app)');
    Alert.alert(
      'Nakatakda ang Background Alarm!',
      'Tutunog at lalabas ang notification pagkatapos ng 10 segundo. Pwede mong pindutin ang Home button o i-swipe away ang app ngayon para masubukan!'
    );
  };

  const isNative = notificationService.isNativeAndroid();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Zero Cost Free Push Notification Banner */}
      <Card style={styles.statusBanner}>
        <View style={styles.badgeRow}>
          <View style={styles.freeBadge}>
            <ShieldCheck size={14} color="#1E5E3A" style={{ marginRight: 4 }} />
            <Text style={styles.freeBadgeText}>100% LIBRE • WALANG BAYAD</Text>
          </View>
          <View style={[styles.freeBadge, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]}>
            <Zap size={14} color="#1565C0" style={{ marginRight: 4 }} />
            <Text style={[styles.freeBadgeText, { color: '#1565C0' }]}>
              {isNative ? 'Native Android System' : 'Web & Mobile Ready'}
            </Text>
          </View>
        </View>
        <Text style={styles.bannerTitle}>Libreng Push Notifications sa Cellphone</Text>
        <Text style={styles.bannerSub}>
          Direktang tumutunog at lumalabas sa notification bar ng iyong telepono nang <b>walang bayad</b>, <b>walang credit card</b>, at <b>hindi kailangan ng Firebase</b>.
        </Text>
      </Card>

      {/* Main Switch Card */}
      <Card style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.toggleTitle}>I-on ang Push Notifications</Text>
            <Text style={styles.toggleSub}>
              Paganahin ang mga alerto para sa bagyo, peste, at pag-aalaga ng pananim.
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggleMaster}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>
      </Card>

      {/* 1-Tap Instant Test Buttons */}
      <Text style={styles.sectionTitle}>Subukan ang Notification Ngayon (1-Tap Test)</Text>
      <Text style={styles.sectionSub}>
        Pindutin ang alinman sa ibaba upang makita at marinig agad ang notification sa iyong telepono:
      </Text>

      <View style={styles.testButtonsGrid}>
        <TouchableOpacity
          style={[styles.testBtn, { borderColor: '#BBDEFB', backgroundColor: '#F0F7FF' }]}
          onPress={handleTestWeather}
          activeOpacity={0.8}
        >
          <CloudRain size={24} color="#0288D1" style={{ marginBottom: 6 }} />
          <Text style={styles.testBtnTitle}>🌧️ Babala sa Panahon</Text>
          <Text style={styles.testBtnSub}>Subukan ang alerto sa ulan o bagyo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testBtn, { borderColor: '#C8E6C9', backgroundColor: '#F1F8F2' }]}
          onPress={handleTestCrop}
          activeOpacity={0.8}
        >
          <Sprout size={24} color="#2E7D32" style={{ marginBottom: 6 }} />
          <Text style={styles.testBtnTitle}>🌾 Paalala sa Pataba</Text>
          <Text style={styles.testBtnSub}>Subukan ang abono schedule (Urea)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testBtn, { borderColor: '#FFE0B2', backgroundColor: '#FFFBF3' }]}
          onPress={handleTestPest}
          activeOpacity={0.8}
        >
          <Bug size={24} color="#E65100" style={{ marginBottom: 6 }} />
          <Text style={styles.testBtnTitle}>🐛 Alerto sa Peste</Text>
          <Text style={styles.testBtnSub}>Subukan ang alerto sa Fall Armyworm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testBtn, { borderColor: '#D1C4E9', backgroundColor: '#F3E5F5' }]}
          onPress={handleTestBackground}
          activeOpacity={0.8}
        >
          <Clock size={24} color="#6A1B9A" style={{ marginBottom: 6 }} />
          <Text style={styles.testBtnTitle}>⏰ Subukan ang Background Alarm (10s)</Text>
          <Text style={styles.testBtnSub}>Tutunog pagkatapos ng 10 segundo kahit nakasara ang app!</Text>
        </TouchableOpacity>
      </View>

      {lastTested && (
        <View style={styles.testSuccessBanner}>
          <Text style={styles.testSuccessText}>
            ✅ Naipadala ang <b>{lastTested}</b>! Tingnan ang notification bar sa itaas ng iyong cellphone.
          </Text>
        </View>
      )}

      {/* Categories Toggle */}
      <Text style={styles.sectionTitle}>Mga Kategorya ng Paalala</Text>
      <Card style={styles.categoriesCard}>
        <View style={styles.categoryRow}>
          <View style={styles.catLeft}>
            <CloudRain size={20} color="#0288D1" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.catLabel}>Babala sa Panahon at Bagyo</Text>
              <Text style={styles.catSub}>Malalakas na ulan, banta ng baha, at init</Text>
            </View>
          </View>
          <Switch
            value={weatherAlerts && enabled}
            onValueChange={setWeatherAlerts}
            disabled={!enabled}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.categoryRow}>
          <View style={styles.catLeft}>
            <Sprout size={20} color="#2E7D32" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.catLabel}>Iskedyul ng Pataba at Pag-aalaga</Text>
              <Text style={styles.catSub}>Basal, mid-tillering, panicle initiation</Text>
            </View>
          </View>
          <Switch
            value={fertilizerReminders && enabled}
            onValueChange={setFertilizerReminders}
            disabled={!enabled}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.categoryRow}>
          <View style={styles.catLeft}>
            <Bug size={20} color="#E65100" style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.catLabel}>Alerto sa Peste at Sakit</Text>
              <Text style={styles.catSub}>Armyworm, aksip, at fungal infection</Text>
            </View>
          </View>
          <Switch
            value={pestWarnings && enabled}
            onValueChange={setPestWarnings}
            disabled={!enabled}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>
      </Card>

      {/* Upcoming Scheduled Reminders */}
      <Text style={styles.sectionTitle}>Nakatakdang mga Gawain sa Bukid</Text>
      {tasks.length === 0 ? (
        <Card variant="flat" style={styles.emptyCard}>
          <Bell size={36} color={Colors.primaryLight} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>Walang Nakatakdang Paalala</Text>
          <Text style={styles.emptySub}>
            Magtakda ng mga gawain sa Farming Planner upang awtomatikong magpaalala ang AgriMate sa araw ng pagpapataba at pagdidilig.
          </Text>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.reminderCard}>
            <View style={styles.reminderRow}>
              <Bell size={18} color={Colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.task_type} • Nakatakda sa {task.scheduled_at ? task.scheduled_at.split('T')[0] : 'Parating na'}
                </Text>
              </View>
            </View>
          </Card>
        ))
      )}
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
  statusBanner: {
    padding: 16,
    backgroundColor: '#EAF5ED',
    borderColor: '#C5E0CB',
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1EBD7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A8D7B2',
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E5E3A',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E5E3A',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#3C5541',
    lineHeight: 18,
  },
  toggleCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  toggleSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
    marginTop: 6,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  testButtonsGrid: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  testBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  testBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  testBtnSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  testSuccessBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  testSuccessText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
  categoriesCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  catSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  reminderCard: {
    padding: Spacing.md,
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
