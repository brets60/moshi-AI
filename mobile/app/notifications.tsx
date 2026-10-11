import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { Bell, Droplets, Sprout, Calendar, ShieldCheck } from 'lucide-react-native';
import { notificationService } from '../src/services/notifications';
import { permissionManager } from '../src/services/permissions';
import { api } from '../src/services/api';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(true);
  const [wateringReminders, setWateringReminders] = useState(true);
  const [fertilizerReminders, setFertilizerReminders] = useState(true);
  const [harvestReminders, setHarvestReminders] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await api.getTasks('upcoming');
      setTasks(data);
    } catch (e) {
      console.warn('Failed to load upcoming tasks:', e);
    }
  };

  const handleToggleMaster = async (val: boolean) => {
    setEnabled(val);
    if (!val) {
      await notificationService.cancelAllReminders();
      Alert.alert('Notifications Disabled', 'All local reminders have been turned off.');
    } else {
      const { granted } = await permissionManager.requestPermission('notifications');
      if (granted) {
        Alert.alert('Notifications Active', 'AgriMate will send reminders for your scheduled farming tasks.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.toggleTitle}>Farm Task Notifications</Text>
            <Text style={styles.toggleSub}>
              Receive scheduled alerts for watering, fertilizing, and crop monitoring.
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggleMaster}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Reminder Categories</Text>
      <Card style={styles.categoriesCard}>
        <View style={styles.categoryRow}>
          <View style={styles.catLeft}>
            <Droplets size={20} color="#1E88E5" style={{ marginRight: 8 }} />
            <Text style={styles.catLabel}>Watering & Irrigation</Text>
          </View>
          <Switch
            value={wateringReminders && enabled}
            onValueChange={setWateringReminders}
            disabled={!enabled}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.categoryRow}>
          <View style={styles.catLeft}>
            <Sprout size={20} color="#2E7D32" style={{ marginRight: 8 }} />
            <Text style={styles.catLabel}>Fertilizer & Nutrition</Text>
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
            <Calendar size={20} color="#F9A825" style={{ marginRight: 8 }} />
            <Text style={styles.catLabel}>Expected Harvest Dates</Text>
          </View>
          <Switch
            value={harvestReminders && enabled}
            onValueChange={setHarvestReminders}
            disabled={!enabled}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Upcoming Scheduled Reminders</Text>
      {tasks.length === 0 ? (
        <Card variant="flat" style={styles.emptyCard}>
          <Bell size={36} color={Colors.primaryLight} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyTitle}>No Upcoming Reminders</Text>
          <Text style={styles.emptySub}>
            Schedule tasks in the Farming Planner to receive automated reminders.
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
                  {task.task_type} • Scheduled for {task.scheduled_at ? task.scheduled_at.split('T')[0] : 'Upcoming'}
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
    marginBottom: 8,
    marginTop: 4,
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
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: 8,
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
