import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Droplets,
  Sprout,
  Bug,
  Eye,
  Wheat,
  Wrench,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { notificationService } from '../../src/services/notifications';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';

const TASK_TYPES = [
  'Watering',
  'Fertilizing',
  'Pest inspection',
  'Crop monitoring',
  'Planting',
  'Harvesting',
  'General',
] as const;

export default function PlannerScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');

  // New Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('Watering');
  const [newCropId, setNewCropId] = useState<string>('');
  const [newCropName, setNewCropName] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasksAndCrops();
  }, [activeTab]);

  const fetchTasksAndCrops = async () => {
    try {
      setLoading(true);
      const [tasksData, cropsData] = await Promise.all([
        api.getTasks(activeTab === 'completed' ? undefined : activeTab),
        api.getCrops('Active'),
      ]);

      if (activeTab === 'completed') {
        setTasks(tasksData.filter((t) => t.status === 'Completed'));
      } else {
        setTasks(tasksData);
      }
      setCrops(cropsData);
    } catch (err) {
      console.warn('Failed to load planner data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasksAndCrops();
  };

  const handleToggleComplete = async (task: any) => {
    try {
      if (task.status === 'Completed') return;
      await api.completeTask(task.id);
      fetchTasksAndCrops();
    } catch (e) {
      console.warn('Failed to complete task:', e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      console.warn('Failed to delete task:', e);
    }
  };

  const handleCreateTask = async () => {
    setModalError(null);
    if (!newTitle.trim()) {
      setModalError('Please enter a task title.');
      return;
    }

    try {
      const scheduledIso = `${newDate}T08:00:00.000Z`;
      const created = await api.createTask({
        title: newTitle.trim(),
        task_type: newType,
        crop_id: newCropId || undefined,
        crop_name: newCropName || undefined,
        priority: newPriority,
        scheduled_at: scheduledIso,
        description: newDescription.trim() || undefined,
        status: 'Pending',
      });

      // Schedule local push notification
      await notificationService.scheduleTaskReminder(created);

      setIsModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      fetchTasksAndCrops();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create task.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Watering':
        return <Droplets size={18} color="#1E88E5" />;
      case 'Fertilizing':
        return <Sprout size={18} color="#2E7D32" />;
      case 'Pest inspection':
        return <Bug size={18} color="#E53935" />;
      case 'Crop monitoring':
        return <Eye size={18} color="#FB8C00" />;
      case 'Harvesting':
        return <Wheat size={18} color="#F9A825" />;
      default:
        return <Wrench size={18} color="#546E7A" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header & New Task Button */}
      <View style={styles.topBar}>
        <View style={styles.tabPillsRow}>
          {(['today', 'upcoming', 'completed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.pillBtn, activeTab === tab && styles.pillBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.pillText, activeTab === tab && styles.pillTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => setIsModalOpen(true)}
          accessibilityLabel="New Task"
        >
          <Plus size={18} color={Colors.white} />
          <Text style={styles.addButtonText}>New Task</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {tasks.length === 0 ? (
          <Card variant="flat" style={styles.emptyCard}>
            <CalendarCheck size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>
              No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'today'
                ? "You have no tasks pending for today. Add a watering or fertilizing schedule!"
                : activeTab === 'upcoming'
                ? 'No future tasks on the schedule. Plan your crop care ahead.'
                : 'No completed tasks recorded yet.'}
            </Text>
            <Button
              title="Add a Farming Task"
              variant="primary"
              size="md"
              onPress={() => setIsModalOpen(true)}
              style={{ marginTop: 16 }}
            />
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <TouchableOpacity
                  style={styles.checkCircle}
                  onPress={() => handleToggleComplete(task)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  {task.status === 'Completed' ? (
                    <CheckCircle2 size={24} color={Colors.success} />
                  ) : (
                    <Circle size={24} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>

                <View style={styles.taskBody}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.status === 'Completed' && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <Badge
                      label={task.priority}
                      variant={
                        task.priority === 'High'
                          ? 'error'
                          : task.priority === 'Medium'
                          ? 'warning'
                          : 'neutral'
                      }
                    />
                  </View>

                  <View style={styles.taskMetaRow}>
                    <View style={styles.typeTag}>
                      {getTypeIcon(task.task_type)}
                      <Text style={styles.typeText}>{task.task_type}</Text>
                    </View>

                    {task.crop_name && (
                      <Text style={styles.cropTag}>• {task.crop_name}</Text>
                    )}

                    <View style={styles.timeTag}>
                      <Clock size={12} color={Colors.textSecondary} style={{ marginRight: 2 }} />
                      <Text style={styles.timeText}>
                        {task.scheduled_at ? task.scheduled_at.split('T')[0] : 'Today'}
                      </Text>
                    </View>
                  </View>

                  {task.description ? (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteTask(task.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={16} color="#B0BEC5" />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* New Task Creation Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Farming Task</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {modalError && (
              <View style={styles.modalErrorBox}>
                <AlertCircle size={16} color={Colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.modalErrorText}>{modalError}</Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Task Title *"
                placeholder="e.g. Morning Tomato Irrigation"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Task Type Selector */}
              <Text style={styles.fieldLabel}>Task Type</Text>
              <View style={styles.typeChipsGrid}>
                {TASK_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, newType === type && styles.typeChipActive]}
                    onPress={() => setNewType(type)}
                  >
                    {getTypeIcon(type)}
                    <Text
                      style={[
                        styles.typeChipText,
                        newType === type && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Linked Crop Selector */}
              {crops.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>Link to Crop (Optional)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      style={[styles.cropChip, !newCropId && styles.cropChipActive]}
                      onPress={() => {
                        setNewCropId('');
                        setNewCropName('');
                      }}
                    >
                      <Text style={[styles.cropChipText, !newCropId && styles.cropChipTextActive]}>
                        General Farm
                      </Text>
                    </TouchableOpacity>
                    {crops.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.cropChip, newCropId === c.id && styles.cropChipActive]}
                        onPress={() => {
                          setNewCropId(c.id);
                          setNewCropName(c.crop_name);
                        }}
                      >
                        <Text
                          style={[
                            styles.cropChipText,
                            newCropId === c.id && styles.cropChipTextActive,
                          ]}
                        >
                          {c.crop_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Priority Selector */}
              <Text style={styles.fieldLabel}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {(['Low', 'Medium', 'High'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      newPriority === p && styles.priorityBtnActive,
                    ]}
                    onPress={() => setNewPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        newPriority === p && styles.priorityTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Scheduled Date (YYYY-MM-DD)"
                placeholder="2026-03-20"
                value={newDate}
                onChangeText={setNewDate}
              />

              <Input
                label="Notes / Instructions (Optional)"
                placeholder="e.g. Check soil dampness before running drip line."
                value={newDescription}
                onChangeText={setNewDescription}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Save Farming Task"
                variant="primary"
                size="lg"
                onPress={handleCreateTask}
                style={{ marginTop: 8, marginBottom: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2EE',
  },
  tabPillsRow: {
    flexDirection: 'row',
  },
  pillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginRight: 6,
    backgroundColor: '#F3F6F4',
  },
  pillBtnActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  taskCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkCircle: {
    marginRight: 12,
    marginTop: 2,
  },
  taskBody: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  cropTag: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  taskDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  modalErrorText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  typeChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    marginRight: 6,
    marginBottom: 6,
  },
  typeChipActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  typeChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  cropChip: {
    backgroundColor: '#F3F6F4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginRight: 8,
  },
  cropChipActive: {
    backgroundColor: Colors.primary,
  },
  cropChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cropChipTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityBtnActive: {
    backgroundColor: Colors.primary,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  priorityTextActive: {
    color: Colors.white,
  },
});
