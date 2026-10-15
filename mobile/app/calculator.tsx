import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {
  Calculator,
  Sprout,
  Droplets,
  DollarSign,
  Info,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';

type CropOption = 'palay_inbred' | 'palay_hybrid' | 'mais' | 'gulay';
type AreaUnit = 'hectare' | 'sqm';
type StageOption = 'full_season' | 'basal' | 'tillering' | 'panicle';

export default function FertilizerCalculatorScreen() {
  const [selectedCrop, setSelectedCrop] = useState<CropOption>('palay_inbred');
  const [areaValue, setAreaValue] = useState<string>('1.0');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('hectare');
  const [selectedStage, setSelectedStage] = useState<StageOption>('full_season');

  // Convert area to hectares
  const parsedArea = parseFloat(areaValue) || 0;
  const areaInHectares = areaUnit === 'hectare' ? parsedArea : parsedArea / 10000;

  // Agricultural formulation standards (per hectare based on PhilRice / DA guidelines)
  const getCalculation = () => {
    let completeBags = 0; // 14-14-14
    let ureaBags = 0; // 46-0-0
    let potashBags = 0; // 0-0-60
    let ammophosBags = 0; // 16-20-0
    let knapsackTanks = 0; // 16L tanks needed
    let foliarSpoonsPerTank = '2 to 3 kutsara (30-45 mL)';

    if (selectedCrop === 'palay_inbred') {
      // Standard inbred recommendation: ~6-8 bags total
      if (selectedStage === 'full_season') {
        completeBags = 3 * areaInHectares;
        ureaBags = 2.5 * areaInHectares;
        potashBags = 1 * areaInHectares;
      } else if (selectedStage === 'basal') {
        completeBags = 3 * areaInHectares;
        ureaBags = 0.5 * areaInHectares;
      } else if (selectedStage === 'tillering') {
        ureaBags = 1.5 * areaInHectares;
      } else if (selectedStage === 'panicle') {
        ureaBags = 0.5 * areaInHectares;
        potashBags = 1 * areaInHectares;
      }
      knapsackTanks = Math.ceil(12 * areaInHectares);
      foliarSpoonsPerTank = '3 kutsara kada 16L na tangke';
    } else if (selectedCrop === 'palay_hybrid') {
      // Hybrid rice requires higher nutrient uptake
      if (selectedStage === 'full_season') {
        completeBags = 4 * areaInHectares;
        ureaBags = 4 * areaInHectares;
        potashBags = 1.5 * areaInHectares;
      } else if (selectedStage === 'basal') {
        completeBags = 4 * areaInHectares;
        ureaBags = 1 * areaInHectares;
      } else if (selectedStage === 'tillering') {
        ureaBags = 2 * areaInHectares;
      } else if (selectedStage === 'panicle') {
        ureaBags = 1 * areaInHectares;
        potashBags = 1.5 * areaInHectares;
      }
      knapsackTanks = Math.ceil(14 * areaInHectares);
      foliarSpoonsPerTank = '3 to 4 kutsara kada 16L na tangke';
    } else if (selectedCrop === 'mais') {
      // Corn recommendation
      if (selectedStage === 'full_season') {
        completeBags = 4 * areaInHectares;
        ureaBags = 3.5 * areaInHectares;
        potashBags = 1 * areaInHectares;
      } else if (selectedStage === 'basal') {
        completeBags = 4 * areaInHectares;
      } else if (selectedStage === 'tillering') {
        ureaBags = 2 * areaInHectares;
      } else if (selectedStage === 'panicle') {
        ureaBags = 1.5 * areaInHectares;
        potashBags = 1 * areaInHectares;
      }
      knapsackTanks = Math.ceil(10 * areaInHectares);
      foliarSpoonsPerTank = '2 to 3 kutsara kada 16L';
    } else {
      // Gulay (Kamatis, Talong, Sili)
      if (selectedStage === 'full_season') {
        completeBags = 3 * areaInHectares;
        ureaBags = 1.5 * areaInHectares;
        potashBags = 2 * areaInHectares;
      } else if (selectedStage === 'basal') {
        completeBags = 3 * areaInHectares;
      } else if (selectedStage === 'tillering') {
        ureaBags = 1.5 * areaInHectares;
      } else if (selectedStage === 'panicle') {
        potashBags = 2 * areaInHectares;
      }
      knapsackTanks = Math.ceil(16 * areaInHectares);
      foliarSpoonsPerTank = '2 kutsara (o 30 mL CalPhos/FPJ)';
    }

    // Estimated current prices (Philippine average per 50kg bag)
    const costComplete = completeBags * 1850;
    const costUrea = ureaBags * 1650;
    const costPotash = potashBags * 1800;
    const totalEstCost = costComplete + costUrea + costPotash;

    return {
      completeBags: Math.round(completeBags * 10) / 10,
      ureaBags: Math.round(ureaBags * 10) / 10,
      potashBags: Math.round(potashBags * 10) / 10,
      totalEstCost: Math.round(totalEstCost),
      knapsackTanks,
      foliarSpoonsPerTank,
    };
  };

  const results = getCalculation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Hero Banner */}
        <Card style={styles.heroBanner}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Calculator size={26} color="#1E5E3A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Kalkulador ng Abono at Spray</Text>
              <Text style={styles.heroSub}>
                Tumpak na bilang ng sako at timpla kada knapsack sprayer batay sa sukat ng sakahan.
              </Text>
            </View>
          </View>
        </Card>

        {/* Step 1: Select Crop */}
        <Text style={styles.sectionHeader}>1. Piliin ang Pananim</Text>
        <View style={styles.cropGrid}>
          <TouchableOpacity
            style={[styles.cropCard, selectedCrop === 'palay_inbred' && styles.cropCardActive]}
            onPress={() => setSelectedCrop('palay_inbred')}
          >
            <Text style={styles.cropEmoji}>🌾</Text>
            <Text style={[styles.cropTitle, selectedCrop === 'palay_inbred' && styles.cropTitleActive]}>
              Palay (Inbred)
            </Text>
            <Text style={styles.cropSub}>NSIC Rc222, Rc160, atbp.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cropCard, selectedCrop === 'palay_hybrid' && styles.cropCardActive]}
            onPress={() => setSelectedCrop('palay_hybrid')}
          >
            <Text style={styles.cropEmoji}>🌱</Text>
            <Text style={[styles.cropTitle, selectedCrop === 'palay_hybrid' && styles.cropTitleActive]}>
              Palay (Hybrid)
            </Text>
            <Text style={styles.cropSub}>Mataas ang ani & abono</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cropCard, selectedCrop === 'mais' && styles.cropCardActive]}
            onPress={() => setSelectedCrop('mais')}
          >
            <Text style={styles.cropEmoji}>🌽</Text>
            <Text style={[styles.cropTitle, selectedCrop === 'mais' && styles.cropTitleActive]}>
              Mais (Corn)
            </Text>
            <Text style={styles.cropSub}>Yellow o White Corn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cropCard, selectedCrop === 'gulay' && styles.cropCardActive]}
            onPress={() => setSelectedCrop('gulay')}
          >
            <Text style={styles.cropEmoji}>🍅</Text>
            <Text style={[styles.cropTitle, selectedCrop === 'gulay' && styles.cropTitleActive]}>
              Gulay (High-Value)
            </Text>
            <Text style={styles.cropSub}>Kamatis, Talong, Sili</Text>
          </TouchableOpacity>
        </View>

        {/* Step 2: Land Area */}
        <Text style={styles.sectionHeader}>2. Sukat ng Sakahan</Text>
        <Card style={styles.areaCard}>
          <View style={styles.areaInputRow}>
            <TextInput
              style={styles.areaTextInput}
              keyboardType="numeric"
              value={areaValue}
              onChangeText={setAreaValue}
              placeholder="1.0"
            />
            <View style={styles.unitToggleGroup}>
              <TouchableOpacity
                style={[styles.unitBtn, areaUnit === 'hectare' && styles.unitBtnActive]}
                onPress={() => setAreaUnit('hectare')}
              >
                <Text style={[styles.unitBtnText, areaUnit === 'hectare' && styles.unitBtnTextActive]}>
                  Ektarya (ha)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, areaUnit === 'sqm' && styles.unitBtnActive]}
                onPress={() => setAreaUnit('sqm')}
              >
                <Text style={[styles.unitBtnText, areaUnit === 'sqm' && styles.unitBtnTextActive]}>
                  Sqm (m²)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick presets */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => {
                setAreaValue('0.25');
                setAreaUnit('hectare');
              }}
            >
              <Text style={styles.presetText}>¼ Hectare (2,500 m²)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => {
                setAreaValue('0.5');
                setAreaUnit('hectare');
              }}
            >
              <Text style={styles.presetText}>½ Hectare (5,000 m²)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => {
                setAreaValue('1.0');
                setAreaUnit('hectare');
              }}
            >
              <Text style={styles.presetText}>1.0 Hectare</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Step 3: Growth Stage */}
        <Text style={styles.sectionHeader}>3. Yugto ng Pag-aabono</Text>
        <View style={styles.stageTabs}>
          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'full_season' && styles.stageTabActive]}
            onPress={() => setSelectedStage('full_season')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'full_season' && styles.stageTabTextActive]}>
              Buong Season (All)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'basal' && styles.stageTabActive]}
            onPress={() => setSelectedStage('basal')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'basal' && styles.stageTabTextActive]}>
              Basal (0-14 DAT)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'tillering' && styles.stageTabActive]}
            onPress={() => setSelectedStage('tillering')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'tillering' && styles.stageTabTextActive]}>
              Tillering (21-28 DAT)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stageTab, selectedStage === 'panicle' && styles.stageTabActive]}
            onPress={() => setSelectedStage('panicle')}
          >
            <Text style={[styles.stageTabText, selectedStage === 'panicle' && styles.stageTabTextActive]}>
              Pamumunga / Buntis
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        <Text style={styles.sectionHeader}>Kinalabasan / Rekomendasyon</Text>
        <Card style={styles.resultsCard}>
          <View style={styles.resultsHeader}>
            <CheckCircle2 size={22} color="#1E5E3A" style={{ marginRight: 8 }} />
            <Text style={styles.resultsTitle}>
              Kailangang Pataba para sa {areaValue} {areaUnit === 'hectare' ? 'Hectare' : 'm²'}:
            </Text>
          </View>

          {/* Bag breakdown */}
          <View style={styles.bagGrid}>
            <View style={styles.bagCard}>
              <Text style={styles.bagQuantity}>{results.completeBags}</Text>
              <Text style={styles.bagUnit}>Sako (50kg)</Text>
              <Text style={styles.bagName}>14-14-14 (Complete)</Text>
              <Text style={styles.bagPurpose}>Ugat at Pagsusuwi</Text>
            </View>

            <View style={[styles.bagCard, { borderColor: '#BBDEFB', backgroundColor: '#F0F7FF' }]}>
              <Text style={[styles.bagQuantity, { color: '#0288D1' }]}>{results.ureaBags}</Text>
              <Text style={styles.bagUnit}>Sako (50kg)</Text>
              <Text style={styles.bagName}>Urea (46-0-0)</Text>
              <Text style={styles.bagPurpose}>Pampalago at Talbos</Text>
            </View>

            <View style={[styles.bagCard, { borderColor: '#FFE0B2', backgroundColor: '#FFFBF3' }]}>
              <Text style={[styles.bagQuantity, { color: '#E65100' }]}>{results.potashBags}</Text>
              <Text style={styles.bagUnit}>Sako (50kg)</Text>
              <Text style={styles.bagName}>0-0-60 (Potash)</Text>
              <Text style={styles.bagPurpose}>Pampabigat ng Butil</Text>
            </View>
          </View>

          {/* Estimated Cost */}
          <View style={styles.costBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <DollarSign size={20} color="#2E7D32" style={{ marginRight: 6 }} />
              <Text style={styles.costLabel}>Tinatayang Gastos sa Pataba:</Text>
            </View>
            <Text style={styles.costValue}>₱{results.totalEstCost.toLocaleString()}</Text>
          </View>

          {/* Knapsack Sprayer Guide */}
          <View style={styles.knapsackBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Droplets size={18} color="#0288D1" style={{ marginRight: 6 }} />
              <Text style={styles.knapsackTitle}>Gabay sa Knapsack Sprayer (16 Liters):</Text>
            </View>
            <Text style={styles.knapsackDetail}>
              • <b>Timpla:</b> {results.foliarSpoonsPerTank}
            </Text>
            <Text style={styles.knapsackDetail}>
              • <b>Kailangang Tangke:</b> Humigit-kumulang <b>{results.knapsackTanks} tangke</b> para sa buong lote mo.
            </Text>
            <Text style={styles.knapsackDetail}>
              • <b>Oras ng Pag-spray:</b> Maaga sa umaga (6:00 - 8:30 AM) o hapon (4:00 - 5:30 PM) kung kailan bukas ang stomata ng dahon.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  heroBanner: {
    backgroundColor: '#EAF5ED',
    borderColor: '#C5E0CB',
    borderWidth: 1,
    padding: 16,
    marginBottom: Spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1EBD7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E5E3A',
    marginBottom: 2,
  },
  heroSub: {
    fontSize: 12,
    color: '#415B46',
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  cropCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2ECE3',
    borderRadius: 14,
    padding: 12,
  },
  cropCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F2F8F4',
  },
  cropEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  cropTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  cropTitleActive: {
    color: Colors.primary,
  },
  cropSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  areaCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  areaInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  areaTextInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F4F7F4',
    borderWidth: 1.5,
    borderColor: '#D4E2D7',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#EDF3EE',
    borderRadius: 12,
    padding: 4,
  },
  unitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  unitBtnTextActive: {
    color: Colors.white,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: '#F1F6F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE9E0',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  stageTabs: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: 4,
  },
  stageTab: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  stageTabActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  stageTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stageTabTextActive: {
    color: Colors.primary,
  },
  resultsCard: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  bagGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  bagCard: {
    flex: 1,
    backgroundColor: '#F3FAF4',
    borderWidth: 1.5,
    borderColor: '#C5E3CB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    textAlign: 'center',
  },
  bagQuantity: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  bagUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bagName: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  bagPurpose: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  costBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E5E3A',
  },
  costValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E5E3A',
  },
  knapsackBox: {
    backgroundColor: '#F0F7FF',
    borderColor: '#CCE4FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  knapsackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0288D1',
  },
  knapsackDetail: {
    fontSize: 12,
    color: '#37474F',
    lineHeight: 18,
    marginBottom: 3,
  },
});
