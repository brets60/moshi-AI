import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  HelpCircle,
  Calendar,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const all = await api.getAnalyses();
      const found = all.find((a) => a.id === id);
      setAnalysis(found || null);
    } catch (e) {
      console.warn('Failed to load analysis:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading diagnostic record...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Stethoscope size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cropTitle}>{analysis.crop_identification}</Text>
            <View style={styles.dateRow}>
              <Calendar size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.dateText}>
                {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : 'Recent'}
              </Text>
            </View>
          </View>
          <Badge
            label={analysis.confidence_level || 'Moderate'}
            variant={analysis.confidence_level === 'High' ? 'success' : 'warning'}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Visible Symptoms</Text>
      <Card style={styles.card}>
        <Text style={styles.bodyText}>{analysis.symptoms}</Text>
      </Card>

      <Text style={styles.sectionTitle}>Possible Causes</Text>
      <Card style={styles.card}>
        {analysis.possible_causes?.map((cause: string, i: number) => (
          <View key={i} style={styles.bulletRow}>
            <AlertTriangle size={16} color="#E65100" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.causeText}>{cause}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
      <Card style={styles.card}>
        {analysis.recommendations?.map((rec: string, i: number) => (
          <View key={i} style={styles.bulletRow}>
            <CheckCircle2 size={16} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.bodyText}>{rec}</Text>
          </View>
        ))}
      </Card>

      {analysis.prevention_methods && (
        <>
          <Text style={styles.sectionTitle}>Prevention & Care</Text>
          <Card style={styles.card}>
            {analysis.prevention_methods.map((prev: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <ShieldCheck size={16} color="#2E7D32" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.bodyText}>{prev}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      <View style={styles.expertBox}>
        <HelpCircle size={20} color="#0D47A1" style={{ marginRight: 8, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.expertTitle}>Local Agricultural Advice:</Text>
          <Text style={styles.expertText}>
            {analysis.expert_referral_guidance ||
              'If symptoms spread or affect commercial yields, consult your local agricultural extension service.'}
          </Text>
        </View>
      </View>
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
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 4,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  causeText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  expertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  expertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 2,
  },
  expertText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 17,
  },
});
