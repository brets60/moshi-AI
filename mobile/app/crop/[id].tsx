import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Sprout,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

export default function CropDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [crop, setCrop] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCropData();
  }, [id]);

  const loadCropData = async () => {
    try {
      setLoading(true);
      const [cropData, allTasks] = await Promise.all([
        api.getCrop(id),
        api.getTasks(),
      ]);
      setCrop(cropData);
      setTasks(allTasks.filter((t) => t.crop_id === id));
    } catch (err) {
      console.warn('Failed to load crop details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Crop Record',
      `Are you sure you want to remove "${crop?.crop_name}" from your farm? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCrop(id);
              router.replace('/(tabs)/crops');
            } catch {
              Alert.alert('Error', 'Could not delete crop record.');
            }
          },
        },
      ]
    );
  };

  if (!crop) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading crop information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Sprout size={32} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cropTitle}>{crop.crop_name}</Text>
            <Text style={styles.cropVariety}>{crop.variety || 'Standard Variety'}</Text>
          </View>
          <Badge
            label={crop.status}
            variant={crop.status === 'Active' ? 'success' : 'neutral'}
          />
        </View>

        <View style={styles.actionButtonsRow}>
          <Button
            title="Edit Details"
            variant="outline"
            size="sm"
            icon={<Edit3 size={16} color={Colors.primary} />}
            onPress={() => router.push({ pathname: '/crop/edit', params: { id: crop.id } })}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Delete"
            variant="danger"
            size="sm"
            icon={<Trash2 size={16} color={Colors.white} />}
            onPress={handleDelete}
          />
        </View>
      </Card>

      {/* Plot & Stage Info */}
      <Text style={styles.sectionTitle}>Growing Specifications</Text>
      <Card style={styles.infoCard}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Growth Stage</Text>
            <Text style={styles.infoValue}>{crop.growth_stage}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Plot Size</Text>
            <Text style={styles.infoValue}>
              {crop.plot_size ? `${crop.plot_size} ${crop.plot_size_unit}` : 'Not set'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Planting Date</Text>
            <Text style={styles.infoValue}>{crop.planting_date || 'Not set'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Expected Harvest</Text>
            <Text style={[styles.infoValue, { color: Colors.primary }]}>
              {crop.expected_harvest_date || 'Not calculated'}
            </Text>
          </View>
        </View>

        {crop.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Field Notes:</Text>
            <Text style={styles.notesText}>{crop.notes}</Text>
          </View>
        ) : null}
      </Card>

      {/* Scheduled Tasks for this crop */}
      <View style={styles.tasksSectionHeader}>
        <Text style={styles.sectionTitle}>Tasks Linked to This Crop</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/planner')}>
          <Text style={styles.addTaskText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Card variant="flat" style={styles.emptyTasksCard}>
          <Text style={styles.emptyTasksText}>
            No scheduled tasks for this crop yet. Add watering, fertilizing, or pest monitoring routines.
          </Text>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskRow}>
              <CheckCircle2
                size={20}
                color={task.status === 'Completed' ? Colors.success : Colors.textMuted}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.task_type} • {task.scheduled_at ? task.scheduled_at.split('T')[0] : 'Today'}
                </Text>
              </View>
              <Badge label={task.priority} variant={task.priority === 'High' ? 'error' : 'neutral'} />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  headerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  cropVariety: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  infoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  notesBox: {
    backgroundColor: '#F5F8F6',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: 8,
  },
  addTaskText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyTasksCard: {
    padding: Spacing.md,
  },
  emptyTasksText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  taskCard: {
    marginBottom: 8,
    padding: 12,
  },
  taskRow: {
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
