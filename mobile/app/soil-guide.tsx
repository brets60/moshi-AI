import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  BookOpen,
  FlaskConical,
  Sprout,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react-native';
import { api } from '../src/services/api';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';

const SOIL_TYPES = [
  { id: 'clay', label: 'Clay Soil', desc: 'Heavy, holds nutrients, drains slowly' },
  { id: 'sandy', label: 'Sandy Soil', desc: 'Light, drains fast, needs organic mulch' },
  { id: 'loamy', label: 'Loamy Soil', desc: 'Balanced, fertile, ideal for most crops' },
  { id: 'silty', label: 'Silty Soil', desc: 'Soft texture, fertile, crusts after rain' },
  { id: 'peaty', label: 'Peat Soil', desc: 'High organic matter, naturally acidic' },
] as const;

export default function SoilGuideScreen() {
  const [selectedSoil, setSelectedSoil] = useState<'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty'>('loamy');
  const [cropType, setCropType] = useState('Tomatoes');
  const [soilPhText, setSoilPhText] = useState('6.5');
  const [guidance, setGuidance] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const phVal = parseFloat(soilPhText);
      const res = await api.getSoilAdvice({
        soilType: selectedSoil,
        soilPh: !isNaN(phVal) ? phVal : undefined,
        cropType: cropType.trim() || 'General Vegetables',
      });
      setGuidance(res);
    } catch (err) {
      console.warn('Soil advice error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Intro Header */}
      <View style={styles.headerBox}>
        <BookOpen size={32} color={Colors.primary} style={{ marginBottom: 6 }} />
        <Text style={styles.headerTitle}>Soil Health & Nutrient Guide</Text>
        <Text style={styles.headerSubtitle}>
          Understand your soil texture, optimize root drainage, and manage fertilizers safely.
        </Text>
      </View>

      {/* Honest Phone Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Info size={20} color="#1565C0" style={{ marginRight: 8, marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.disclaimerTitle}>Physical Testing Note:</Text>
          <Text style={styles.disclaimerText}>
            Smartphones cannot directly measure soil pH or chemical nutrient levels through sensors. Accurate fertilizer decisions are best informed by physical soil test strips, calibrated probes, or local agricultural extension laboratory testing.
          </Text>
        </View>
      </View>

      {/* Step 1: Soil Texture Selection */}
      <Text style={styles.sectionTitle}>1. Select Your Soil Type</Text>
      <View style={styles.soilGrid}>
        {SOIL_TYPES.map((soil) => (
          <TouchableOpacity
            key={soil.id}
            style={[
              styles.soilCard,
              selectedSoil === soil.id && styles.soilCardActive,
            ]}
            onPress={() => setSelectedSoil(soil.id as any)}
          >
            <Text style={[styles.soilName, selectedSoil === soil.id && styles.soilNameActive]}>
              {soil.label}
            </Text>
            <Text style={styles.soilDesc}>{soil.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 2: Crop & pH Inputs */}
      <Text style={styles.sectionTitle}>2. Enter Crop & Known pH</Text>
      <Card style={styles.inputCard}>
        <Input
          label="Target Crop"
          placeholder="e.g. Tomatoes, Maize, Carrots"
          value={cropType}
          onChangeText={setCropType}
        />

        <Input
          label="Measured Soil pH (Optional, 4.0 - 9.0)"
          placeholder="e.g. 6.5 (Leave blank if unmeasured)"
          keyboardType="numeric"
          value={soilPhText}
          onChangeText={setSoilPhText}
          helperText="Neutral is 7.0. Most vegetables thrive between 6.0 and 6.8."
        />

        <Button
          title="Generate Soil & Nutrient Advice"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<FlaskConical size={18} color={Colors.white} />}
          onPress={handleEvaluate}
          style={{ marginTop: 8 }}
        />
      </Card>

      {/* Guidance Results */}
      {guidance && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Customized Soil Recommendations</Text>

          {/* Texture & Drainage Summary */}
          <Card style={styles.resultCard}>
            <Text style={styles.cardTitle}>🌱 Texture & Water Retention</Text>
            <Text style={styles.cardBody}>{guidance.soil_type_summary}</Text>
            <View style={styles.subBox}>
              <Text style={styles.subBoxTitle}>Drainage Management:</Text>
              <Text style={styles.subBoxText}>{guidance.drainage_and_water_holding}</Text>
            </View>
          </Card>

          {/* pH Analysis */}
          <Card style={styles.resultCard}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>🧪 Soil pH Analysis</Text>
              <Badge
                label={guidance.ph_analysis?.status || 'Unmeasured'}
                variant={guidance.ph_analysis?.status === 'Optimal' ? 'success' : 'warning'}
              />
            </View>
            <Text style={styles.cardBody}>
              Ideal Range for {cropType}: <Text style={{ fontWeight: '700' }}>{guidance.ph_analysis?.ideal_range_for_crop}</Text>
            </Text>
            <Text style={[styles.cardBody, { marginTop: 6 }]}>
              {guidance.ph_analysis?.actionable_advice}
            </Text>
          </Card>

          {/* Organic Amendments */}
          <Card style={styles.resultCard}>
            <Text style={styles.cardTitle}>🍂 Organic Soil Amendments</Text>
            {guidance.organic_matter_advice?.map((item: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                <CheckCircle2 size={16} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </Card>

          {/* Macronutrients N-P-K Overview */}
          <Card style={styles.resultCard}>
            <Text style={styles.cardTitle}>📊 Essential Macronutrients (N-P-K)</Text>
            <View style={styles.npkItem}>
              <Text style={styles.npkTitle}>Nitrogen (N):</Text>
              <Text style={styles.npkDesc}>
                {guidance.fertilizer_guidance?.macronutrients_overview?.nitrogen}
              </Text>
            </View>
            <View style={styles.npkItem}>
              <Text style={styles.npkTitle}>Phosphorus (P):</Text>
              <Text style={styles.npkDesc}>
                {guidance.fertilizer_guidance?.macronutrients_overview?.phosphorus}
              </Text>
            </View>
            <View style={styles.npkItem}>
              <Text style={styles.npkTitle}>Potassium (K):</Text>
              <Text style={styles.npkDesc}>
                {guidance.fertilizer_guidance?.macronutrients_overview?.potassium}
              </Text>
            </View>
          </Card>

          {/* Fertilizer Safety & Cautions */}
          <View style={styles.cautionContainer}>
            <View style={styles.cautionHeader}>
              <AlertTriangle size={18} color="#D84315" />
              <Text style={styles.cautionHeaderText}>Responsible Fertilizer Safety:</Text>
            </View>
            {guidance.fertilizer_guidance?.cautions?.map((c: string, idx: number) => (
              <Text key={idx} style={styles.cautionItemText}>
                • {c}
              </Text>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
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
  headerBox: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 4,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D47A1',
    marginBottom: 2,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 17,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  soilGrid: {
    marginBottom: Spacing.md,
  },
  soilCard: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#EDF2EE',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  soilCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F1F8F3',
  },
  soilName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  soilNameActive: {
    color: Colors.primaryDark,
  },
  soilDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  resultsContainer: {
    marginTop: Spacing.sm,
  },
  resultCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  subBox: {
    backgroundColor: '#F3F6F4',
    padding: 10,
    borderRadius: BorderRadius.sm,
    marginTop: 8,
  },
  subBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 2,
  },
  subBoxText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bulletText: {
    fontSize: 13,
    color: Colors.text,
    flex: 1,
    lineHeight: 18,
  },
  npkItem: {
    marginTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  npkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  npkDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
    lineHeight: 16,
  },
  cautionContainer: {
    backgroundColor: '#FBE9E7',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: '#D84315',
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cautionHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D84315',
    marginLeft: 6,
  },
  cautionItemText: {
    fontSize: 12,
    color: '#3E2723',
    lineHeight: 17,
    marginTop: 2,
  },
});
