import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CloudSun,
  Sprout,
  Stethoscope,
  MessageSquare,
  CalendarDays,
  PlusCircle,
  Settings,
  Bell,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Calculator,
  DollarSign,
  Receipt,
  Bug,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useOffline } from '../../src/context/OfflineContext';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOffline, syncing, triggerSync } = useOffline();

  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<any | null>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [weatherData, cropsData, tasksData, analysesData] = await Promise.all([
        api.getWeather(37.7749, -122.4194, user?.farm_location || 'Central Valley'),
        api.getCrops('Active'),
        api.getTasks('today'),
        api.getAnalyses(),
      ]);

      setWeather(weatherData);
      setCrops(cropsData);
      setTasks(tasksData);
      setAnalyses(analysesData);
    } catch (err) {
      console.warn('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      console.warn('Task completion error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner isOffline={isOffline} onRetrySync={triggerSync} syncing={syncing} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Top Farmer Greeting Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingTitle}>
              Hello, {user?.full_name ? user.full_name.split(' ')[0] : 'Farmer'}! 👋
            </Text>
            <Text style={styles.farmLocationText}>
              {user?.farm_name || 'My Family Farm'} • {user?.farm_location || 'Central Valley'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={onRefresh}
              accessibilityLabel="Refresh App"
            >
              <RefreshCw size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push('/notifications')}
              accessibilityLabel="Notifications"
            >
              <Bell size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings"
            >
              <Settings size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Weather Card */}
        {weather && (
          <Card
            variant="elevated"
            style={styles.weatherCard}
            onPress={() => router.push('/weather')}
          >
            <View style={styles.weatherHeader}>
              <View style={styles.weatherTitleRow}>
                <CloudSun size={24} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.weatherLocation}>{weather.location_name}</Text>
              </View>
              <View style={styles.viewWeatherDetails}>
                <Text style={styles.viewWeatherText}>Full Forecast</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </View>

            <View style={styles.weatherStatsRow}>
              <View style={styles.tempBox}>
                <Text style={styles.tempValue}>
                  {Math.round(weather.current.temperature)}°C
                </Text>
                <Text style={styles.weatherDesc}>
                  {weather.current.weather_description}
                </Text>
              </View>

              <View style={styles.weatherMetrics}>
                <View style={styles.metricItem}>
                  <Droplets size={16} color="#1E88E5" style={{ marginRight: 4 }} />
                  <Text style={styles.metricText}>
                    Rain: {weather.current.precipitation_probability ?? 0}%
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Wind size={16} color="#546E7A" style={{ marginRight: 4 }} />
                  <Text style={styles.metricText}>
                    Wind: {Math.round(weather.current.wind_speed)} km/h
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Thermometer size={16} color="#FB8C00" style={{ marginRight: 4 }} />
                  <Text style={styles.metricText}>
                    Humidity: {weather.current.relative_humidity}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Practical Agricultural Guidance */}
            {weather.farming_advisory && (
              <View style={styles.advisoryBanner}>
                <Text style={styles.advisoryTitle}>Today's Field Advisory:</Text>
                <Text style={styles.advisoryText}>
                  {weather.farming_advisory.irrigation_advice}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Quick Shortcuts */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.shortcutsGrid}>
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#E8F5E9' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/crops')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#C8E6C9' }]}>
              <Sprout size={24} color={Colors.primary} />
            </View>
            <Text style={styles.shortcutTitle}>My Crops</Text>
            <Text style={styles.shortcutSubtitle}>{crops.length} Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#E3F2FD' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/doctor')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#BBDEFB' }]}>
              <Stethoscope size={24} color="#1565C0" />
            </View>
            <Text style={styles.shortcutTitle}>Plant Doctor</Text>
            <Text style={styles.shortcutSubtitle}>Diagnose Disease</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#FFF3E0' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#FFE0B2' }]}>
              <MessageSquare size={24} color="#E65100" />
            </View>
            <Text style={styles.shortcutTitle}>Ask AI</Text>
            <Text style={styles.shortcutSubtitle}>Farming Q&A</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#F3E5F5' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/soil-guide')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#E1BEE7' }]}>
              <BookOpen size={24} color="#6A1B9A" />
            </View>
            <Text style={styles.shortcutTitle}>Soil Guide</Text>
            <Text style={styles.shortcutSubtitle}>pH & Fertilizers</Text>
          </TouchableOpacity>
        </View>

        {/* Smart Agricultural Tools (Bagong Kagamitan sa Pagsasaka) */}
        <Text style={styles.sectionHeader}>Mga Bagong Gamit sa Pagsasaka</Text>
        <View style={styles.shortcutsGrid}>
          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#E8F5E9' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/calculator')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#C8E6C9' }]}>
              <Calculator size={24} color="#1E5E3A" />
            </View>
            <Text style={styles.shortcutTitle}>Kalkulador</Text>
            <Text style={styles.shortcutSubtitle}>Abono at Spray</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#FFF8E1' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/market-prices')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#FFECB3' }]}>
              <DollarSign size={24} color="#F57F17" />
            </View>
            <Text style={styles.shortcutTitle}>Bantay Presyo</Text>
            <Text style={styles.shortcutSubtitle}>DA Market Watch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#E0F2F1' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/ledger')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#B2DFDB' }]}>
              <Receipt size={24} color="#00695C" />
            </View>
            <Text style={styles.shortcutTitle}>Gastos at Kita</Text>
            <Text style={styles.shortcutSubtitle}>Farm Bookkeeping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shortcutCard, { backgroundColor: '#FBE9E7' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/pest-guide')}
          >
            <View style={[styles.shortcutIconCircle, { backgroundColor: '#FFCCBC' }]}>
              <Bug size={24} color="#D84315" />
            </View>
            <Text style={styles.shortcutTitle}>Peste at Lunas</Text>
            <Text style={styles.shortcutSubtitle}>DIY Organiko</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Today's Farming Tasks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/planner')}>
            <Text style={styles.seeAllText}>Open Planner</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <Card variant="flat" style={styles.emptyTasksCard}>
            <CalendarDays size={36} color={Colors.primaryLight} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Tasks Scheduled for Today</Text>
            <Text style={styles.emptySubtitle}>
              Great job! Your fields are all set, or you can add a watering or fertilizing reminder.
            </Text>
            <Button
              title="Add a Farming Task"
              variant="outline"
              size="sm"
              icon={<PlusCircle size={16} color={Colors.primary} />}
              onPress={() => router.push('/(tabs)/planner')}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <TouchableOpacity
                  style={styles.checkCircle}
                  onPress={() => handleCompleteTask(task.id)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <CheckCircle2 size={24} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskMeta}>
                    {task.task_type} • {task.crop_name || 'Field'}
                  </Text>
                </View>

                <Badge
                  label={task.priority}
                  variant={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'neutral'}
                />
              </View>
            </Card>
          ))
        )}

        {/* Crops Overview / Welcome Card */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Active Plots & Crops</Text>
          <TouchableOpacity onPress={() => router.push('/crop/add')}>
            <Text style={styles.addCropAction}>+ Add Crop</Text>
          </TouchableOpacity>
        </View>

        {crops.length === 0 ? (
          <Card variant="flat" style={styles.welcomeCard}>
            <Sprout size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.welcomeTitle}>Welcome to AgriMate AI!</Text>
            <Text style={styles.welcomeSubtitle}>
              You don't have any crops saved yet. Add your first crop to track planting dates, get tailored weather notices, and record growth stages.
            </Text>
            <Button
              title="Add Your First Crop"
              variant="primary"
              size="md"
              icon={<PlusCircle size={18} color={Colors.white} />}
              onPress={() => router.push('/crop/add')}
              style={{ marginTop: 16 }}
            />
          </Card>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
            {crops.map((crop) => (
              <Card
                key={crop.id}
                style={styles.cropMiniCard}
                onPress={() => router.push(`/crop/${crop.id}`)}
              >
                <View style={styles.cropMiniHeader}>
                  <Sprout size={20} color={Colors.primary} />
                  <Badge label={crop.growth_stage} variant="success" />
                </View>
                <Text style={styles.cropMiniName}>{crop.crop_name}</Text>
                <Text style={styles.cropMiniVariety}>{crop.variety || 'Standard'}</Text>
                <Text style={styles.cropMiniPlot}>
                  {crop.plot_size} {crop.plot_size_unit}
                </Text>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Recent Plant Analyses */}
        {analyses.length > 0 && (
          <>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeader}>Recent Plant Health Checks</Text>
              <TouchableOpacity onPress={() => router.push('/saved-history')}>
                <Text style={styles.seeAllText}>History</Text>
              </TouchableOpacity>
            </View>

            {analyses.slice(0, 2).map((analysis) => (
              <Card
                key={analysis.id}
                style={styles.analysisCard}
                onPress={() => router.push(`/analysis/${analysis.id}`)}
              >
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisCrop}>{analysis.crop_identification}</Text>
                  <Badge
                    label={analysis.confidence_level || 'Moderate'}
                    variant={analysis.confidence_level === 'High' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.analysisSymptoms} numberOfLines={2}>
                  Symptoms: {analysis.symptoms}
                </Text>
                <Text style={styles.analysisAction} numberOfLines={1}>
                  Recommended: {analysis.recommendations?.[0] || 'Keep regular monitoring.'}
                </Text>
              </Card>
            ))}
          </>
        )}

        {/* Quick Agricultural Tip */}
        <Card variant="flat" style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipBadge}>🌱 AgriMate Tip of the Day</Text>
          </View>
          <Text style={styles.tipText}>
            Water early in the morning so damp leaves dry before mid-day heat and nightfall. This cuts down leaf blight and powdery mildew by over 40%!
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  farmLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  weatherCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  weatherTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  viewWeatherDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewWeatherText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 2,
  },
  weatherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  tempBox: {
    flex: 1,
  },
  tempValue: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
  },
  weatherDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  weatherMetrics: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  advisoryBanner: {
    backgroundColor: '#F1F8F3',
    borderRadius: BorderRadius.md,
    padding: 10,
    marginTop: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  advisoryText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  addCropAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  shortcutCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  shortcutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  shortcutSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyTasksCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: 4,
    lineHeight: 18,
  },
  taskCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  welcomeCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  cropsScroll: {
    marginBottom: Spacing.md,
  },
  cropMiniCard: {
    width: 150,
    marginRight: 12,
    padding: 12,
  },
  cropMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropMiniName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  cropMiniVariety: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cropMiniPlot: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 6,
  },
  analysisCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  analysisCrop: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  analysisSymptoms: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  analysisAction: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: '#F1F8F3',
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#D8E8DC',
  },
  tipHeader: {
    marginBottom: 4,
  },
  tipBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  tipText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
});
