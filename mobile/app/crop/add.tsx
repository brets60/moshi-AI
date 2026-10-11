import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Sprout, AlertCircle } from 'lucide-react-native';
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

const PLOT_UNITS = ['acres', 'hectares', 'sq_meters', 'plots'] as const;

export default function AddCropScreen() {
  const router = useRouter();

  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [plotSize, setPlotSize] = useState('1.0');
  const [plotUnit, setPlotUnit] = useState<string>('acres');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [growthStage, setGrowthStage] = useState<string>('Seedling');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!cropName.trim()) {
      setError('Please provide a crop name (e.g. Tomatoes, Maize, Carrots).');
      return;
    }

    setLoading(true);
    try {
      await api.createCrop({
        crop_name: cropName.trim(),
        variety: variety.trim() || undefined,
        plot_size: parseFloat(plotSize) || 1.0,
        plot_size_unit: plotUnit,
        planting_date: plantingDate || undefined,
        expected_harvest_date: expectedHarvestDate || undefined,
        growth_stage: growthStage,
        status: 'Active',
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to save crop record.');
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
            placeholder="e.g. Roma Tomatoes"
            value={cropName}
            onChangeText={setCropName}
          />

          <Input
            label="Crop Variety (Optional)"
            placeholder="e.g. Determinate San Marzano"
            value={variety}
            onChangeText={setVariety}
          />

          {/* Plot Size & Units */}
          <Text style={styles.fieldLabel}>Plot Size & Unit</Text>
          <View style={styles.unitRow}>
            <Input
              placeholder="1.0"
              keyboardType="numeric"
              value={plotSize}
              onChangeText={setPlotSize}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <View style={styles.unitsPills}>
              {PLOT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitPill, plotUnit === unit && styles.unitPillActive]}
                  onPress={() => setPlotUnit(unit)}
                >
                  <Text style={[styles.unitText, plotUnit === unit && styles.unitTextActive]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Growth Stage Selector */}
          <Text style={styles.fieldLabel}>Current Growth Stage</Text>
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
            label="Planting Date (YYYY-MM-DD)"
            placeholder="2026-03-15"
            value={plantingDate}
            onChangeText={setPlantingDate}
          />

          <Input
            label="Expected Harvest Date (YYYY-MM-DD)"
            placeholder="2026-07-20"
            value={expectedHarvestDate}
            onChangeText={setExpectedHarvestDate}
          />

          <Input
            label="Plot Notes & Soil Details (Optional)"
            placeholder="e.g. Planted along south slope; organic straw mulch applied."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Crop Record"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSubmit}
            style={{ marginTop: Spacing.md }}
          />

          <Button
            title="Cancel"
            variant="ghost"
            size="md"
            onPress={() => router.back()}
            style={{ marginTop: 8 }}
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
  unitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  unitsPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1.5,
    marginTop: 4,
  },
  unitPill: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F3F6F4',
    borderRadius: BorderRadius.sm,
    marginRight: 4,
    marginBottom: 4,
  },
  unitPillActive: {
    backgroundColor: Colors.primary,
  },
  unitText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  unitTextActive: {
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
