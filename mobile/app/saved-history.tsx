import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { History, Stethoscope, ChevronRight, Bookmark } from 'lucide-react-native';
import { api } from '../src/services/api';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';

export default function SavedHistoryScreen() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalyses();
      setAnalyses(data);
    } catch (e) {
      console.warn('Failed to load history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        <Text style={styles.subtitle}>
          All saved AI plant diagnostics and saved agricultural advice are safely preserved here for offline review.
        </Text>

        {analyses.length === 0 ? (
          <Card variant="flat" style={styles.emptyCard}>
            <History size={48} color={Colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Saved Analyses Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you diagnose plant diseases in the Plant Doctor or save answers from the AI Assistant, they will appear here.
            </Text>
          </Card>
        ) : (
          analyses.map((item) => (
            <Card
              key={item.id}
              style={styles.historyCard}
              onPress={() => router.push(`/analysis/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleGroup}>
                  <Stethoscope size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.cropName}>{item.crop_identification}</Text>
                </View>
                <Badge
                  label={item.confidence_level || 'Moderate'}
                  variant={item.confidence_level === 'High' ? 'success' : 'warning'}
                />
              </View>

              <Text style={styles.symptomsText} numberOfLines={2}>
                Symptoms: {item.symptoms}
              </Text>

              <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                </Text>
                <View style={styles.openRow}>
                  <Text style={styles.openText}>View Full Analysis</Text>
                  <ChevronRight size={14} color={Colors.primary} />
                </View>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
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
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  historyCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  symptomsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 2,
  },
});
