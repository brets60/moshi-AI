import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sprout,
  Plus,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';

type CropStatusFilter = 'Active' | 'Harvested' | 'Archived';

export default function CropsScreen() {
  const router = useRouter();

  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<CropStatusFilter>('Active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCrops();
  }, [activeTab]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const data = await api.getCrops(activeTab);
      setCrops(data);
    } catch (err) {
      console.warn('Failed to load crops:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCrops();
  };

  const filteredCrops = crops.filter((crop) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      crop.crop_name.toLowerCase().includes(q) ||
      (crop.variety && crop.variety.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      {/* Search & Add Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <Search size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops by name or variety..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/crop/add')}
          accessibilityLabel="Add New Crop"
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Crop</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.tabsRow}>
        {(['Active', 'Harvested', 'Archived'] as CropStatusFilter[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {filteredCrops.length === 0 ? (
          <Card variant="flat" style={styles.emptyCard}>
            <Sprout size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No {activeTab} Crops Found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'Active'
                ? 'Start recording your field plantings to track watering routines and expected harvest times.'
                : `You currently have no crops labeled as ${activeTab}.`}
            </Text>
            {activeTab === 'Active' && (
              <Button
                title="Add Your First Crop"
                variant="primary"
                size="md"
                onPress={() => router.push('/crop/add')}
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        ) : (
          filteredCrops.map((crop) => (
            <Card
              key={crop.id}
              style={styles.cropCard}
              onPress={() => router.push(`/crop/${crop.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cropTitleGroup}>
                  <View style={styles.cropIconBadge}>
                    <Sprout size={24} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.cropName}>{crop.crop_name}</Text>
                    <Text style={styles.cropVariety}>{crop.variety || 'Standard Variety'}</Text>
                  </View>
                </View>

                <Badge
                  label={crop.growth_stage}
                  variant={crop.status === 'Active' ? 'success' : 'neutral'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Layers size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>
                    {crop.plot_size ? `${crop.plot_size} ${crop.plot_size_unit}` : 'Plot size not set'}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Calendar size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.detailText}>
                    {crop.planting_date ? `Planted: ${crop.planting_date}` : 'Planting date not set'}
                  </Text>
                </View>

                {crop.expected_harvest_date && (
                  <View style={styles.detailItem}>
                    <TrendingUp size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.detailText, { color: Colors.primary, fontWeight: '700' }]}>
                      Harvest: {crop.expected_harvest_date}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.viewRow}>
                <Text style={styles.viewDetailsText}>View Growth & Tasks</Text>
                <ChevronRight size={16} color={Colors.primary} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2EE',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F4',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 44,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2EE',
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    backgroundColor: '#F3F6F4',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  cropCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  cropVariety: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2EE',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 2,
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
});
