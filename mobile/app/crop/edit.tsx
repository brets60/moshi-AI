import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

const GROWTH_STAGES = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Maturity / Harvest',
] as const;

const STATUSES = ['Active', 'Harvested', 'Archived'] as const;

export default function EditCropScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [growthStage, setGrowthStage] = useState<string>('Seedling');
  const [status, setStatus] = useState<string>('Active');
  const [plantingDate, setPlantingDate] = useState('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCrop();
  }, [id]);

  const loadCrop = async () => {
    try {
      const data = await api.getCrop(id);
      setCropName(data.crop_name || '');
      setVariety(data.variety || '');
      setPlotSize(data.plot_size ? String(data.plot_size) : '');
      setGrowthStage(data.growth_stage || 'Seedling');
      setStatus(data.status || 'Active');
      setPlantingDate(data.planting_date || '');
      setExpectedHarvestDate(data.expected_harvest_date || '');
      setNotes(data.notes || '');
    } catch (e) {
      console.warn('Failed to load crop for editing:', e);
    }
  };

  const handleUpdate = async () => {
    setError(null);
    if (!cropName.trim()) {
      setError('Crop name is required.');
      return;
    }

    setLoading(true);
    try {
      await api.updateCrop(id, {
        crop_name: cropName.trim(),
        variety: variety.trim() || undefined,
        plot_size: plotSize ? parseFloat(plotSize) : undefined,
        growth_stage: growthStage,
        status,
        planting_date: plantingDate || undefined,
        expected_harvest_date: expectedHarvestDate || undefined,
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update crop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#F8FAF8' }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={18} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Input
            label="Crop Name *"
            value={cropName}
            onChangeText={setCropName}
          />

          <Input
            label="Variety"
            value={variety}
            onChangeText={setVariety}
          />

          {/* Status Selector */}
          <Text style={styles.fieldLabel}>Current Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusChip, status === st && styles.statusChipActive]}
                onPress={() => setStatus(st)}
              >
                <Text style={[styles.statusText, status === st && styles.statusTextActive]}>
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Growth Stage Selector */}
          <Text style={styles.fieldLabel}>Growth Stage</Text>
          <View style={styles.stageGrid}>
            {GROWTH_STAGES.map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[styles.stageChip, growthStage === stage && styles.stageChipActive]}
                onPress={() => setGrowthStage(stage)}
              >
                <Text style={[styles.stageText, growthStage === stage && styles.stageTextActive]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Plot Size (Acres)"
            keyboardType="numeric"
            value={plotSize}
            onChangeText={setPlotSize}
          />

          <Input
            label="Planting Date (YYYY-MM-DD)"
            value={plantingDate}
            onChangeText={setPlantingDate}
          />

          <Input
            label="Expected Harvest Date (YYYY-MM-DD)"
            value={expectedHarvestDate}
            onChangeText={setExpectedHarvestDate}
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Update Crop Record"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleUpdate}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  statusChip: {
    backgroundColor: '#F3F6F4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statusTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  stageChip: {
    backgroundColor: '#F3F6F4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    marginRight: 6,
    marginBottom: 6,
  },
  stageChipActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  stageText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  stageTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
