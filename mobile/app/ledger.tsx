import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Trash2,
  Calendar,
  Tag,
  Check,
  Receipt,
  X,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';

interface LedgerEntry {
  id: string;
  type: 'expense' | 'income';
  category: string;
  description: string;
  amount: number;
  date: string;
}

const STORAGE_KEY = '@agrimate_farm_ledger_v1';

const INITIAL_ENTRIES: LedgerEntry[] = [
  {
    id: 'entry_1',
    type: 'income',
    category: 'Benta ng Ani',
    description: 'Benta ng 60 kaban ng Palay (3,000 kg @ ₱23/kg)',
    amount: 69000,
    date: '2026-10-12',
  },
  {
    id: 'entry_2',
    type: 'expense',
    category: 'Pataba at Abono',
    description: '3 sako ng 14-14-14 Complete & 2 sako Urea',
    amount: 8850,
    date: '2026-09-15',
  },
  {
    id: 'entry_3',
    type: 'expense',
    category: 'Upa at Pasweldo',
    description: 'Upa sa pagtatanim at pagsabog ng pataba',
    amount: 6500,
    date: '2026-09-18',
  },
  {
    id: 'entry_4',
    type: 'expense',
    category: 'Makinarya at Krudo',
    description: 'Upa sa Combine Harvester sa anihan',
    amount: 8500,
    date: '2026-10-10',
  },
  {
    id: 'entry_5',
    type: 'expense',
    category: 'Binhi at Punla',
    description: 'Certified inbred seeds (Rc222)',
    amount: 3200,
    date: '2026-08-25',
  },
];

export default function FarmLedgerScreen() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  const [formCategory, setFormCategory] = useState('Pataba at Abono');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries(INITIAL_ENTRIES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ENTRIES));
      }
    } catch (e) {
      console.warn('Error loading ledger:', e);
      setEntries(INITIAL_ENTRIES);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLedger();
  };

  const saveEntries = async (updated: LedgerEntry[]) => {
    setEntries(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving ledger:', e);
    }
  };

  const handleAddEntry = () => {
    const parsedAmount = parseFloat(formAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Maling Halaga', 'Mangyaring maglagay ng tamang halaga sa piso.');
      return;
    }
    if (!formDescription.trim()) {
      Alert.alert('Kulang na Detalye', 'Maglagay ng maikling paglalarawan ng gastos o benta.');
      return;
    }

    const newEntry: LedgerEntry = {
      id: `entry_${Date.now()}`,
      type: formType,
      category: formCategory,
      description: formDescription.trim(),
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);

    // Reset Form
    setFormDescription('');
    setFormAmount('');
    setShowAddModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Burahin ang Tala', 'Sigurado ka bang nais mong alisin ang talang ito?', [
      { text: 'Kanselahin', style: 'cancel' },
      {
        text: 'Burahin',
        style: 'destructive',
        onPress: () => {
          const updated = entries.filter((e) => e.id !== id);
          saveEntries(updated);
        },
      },
    ]);
  };

  // Computations
  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Header Hero Banner */}
        <Card style={styles.heroBanner}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Receipt size={26} color="#1E5E3A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Talaan ng Gastos at Kita</Text>
              <Text style={styles.heroSub}>
                Bookkeeping para sa magsasaka upang malaman ang tunay na tinubo sa bawat cropping season.
              </Text>
            </View>
          </View>
        </Card>

        {/* Financial Overview Cards */}
        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <TrendingUp size={16} color="#2E7D32" />
              <Text style={styles.summaryLabel}>Kabuuang Benta</Text>
            </View>
            <Text style={[styles.summaryValue, { color: '#2E7D32' }]}>
              ₱{totalIncome.toLocaleString()}
            </Text>
          </Card>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <TrendingDown size={16} color="#D32F2F" />
              <Text style={styles.summaryLabel}>Kabuuang Gastos</Text>
            </View>
            <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>
              ₱{totalExpense.toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Net Profit Banner */}
        <Card
          style={[
            styles.netProfitCard,
            netProfit >= 0 ? styles.profitPositive : styles.profitNegative,
          ]}
        >
          <View style={styles.netProfitRow}>
            <View>
              <Text style={styles.netProfitSub}>
                {netProfit >= 0 ? '🎉 Kabuuang Tubo (Net Profit):' : '⚠️ Lugi / Depisit:'}
              </Text>
              <Text
                style={[
                  styles.netProfitValue,
                  netProfit >= 0 ? { color: '#1E5E3A' } : { color: '#C62828' },
                ]}
              >
                ₱{Math.abs(netProfit).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <PlusCircle size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Magtala</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Add Entry Modal / In-Page Form */}
        {showAddModal && (
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Magdagdag ng Tala</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Type selector */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[styles.typeBtn, formType === 'expense' && styles.typeBtnExpense]}
                onPress={() => {
                  setFormType('expense');
                  setFormCategory('Pataba at Abono');
                }}
              >
                <Text style={[styles.typeBtnText, formType === 'expense' && styles.typeBtnTextActive]}>
                  🔴 Gastos (Expense)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, formType === 'income' && styles.typeBtnIncome]}
                onPress={() => {
                  setFormType('income');
                  setFormCategory('Benta ng Ani');
                }}
              >
                <Text style={[styles.typeBtnText, formType === 'income' && styles.typeBtnTextActive]}>
                  🟢 Benta (Income)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Category Chips */}
            <Text style={styles.inputLabel}>Kategorya:</Text>
            <View style={styles.catChipsGrid}>
              {(formType === 'expense'
                ? ['Pataba at Abono', 'Upa at Pasweldo', 'Binhi at Punla', 'Makinarya at Krudo', 'Pestisidyo', 'Iba pa']
                : ['Benta ng Ani', 'Subsidiya ng Gobyerno', 'Iba pang Kita']
              ).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, formCategory === cat && styles.catChipActive]}
                  onPress={() => setFormCategory(cat)}
                >
                  <Text style={[styles.catChipText, formCategory === cat && styles.catChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount input */}
            <Text style={styles.inputLabel}>Halaga (Piso ₱):</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="Hal. 2500"
              value={formAmount}
              onChangeText={setFormAmount}
            />

            {/* Description input */}
            <Text style={styles.inputLabel}>Deskripsyon / Detalye:</Text>
            <TextInput
              style={styles.descInput}
              placeholder="Hal. 2 sako ng Urea sa Tindahan ni Mang Juan"
              value={formDescription}
              onChangeText={setFormDescription}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddEntry}>
              <Check size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>I-save ang Tala</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Ledger Entries List */}
        <Text style={styles.sectionHeader}>Kasaysayan ng mga Tala ({entries.length})</Text>
        <View style={styles.entriesList}>
          {entries.map((entry) => (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryRow}>
                <View
                  style={[
                    styles.entryIconBox,
                    entry.type === 'income' ? styles.entryIncomeBox : styles.entryExpenseBox,
                  ]}
                >
                  {entry.type === 'income' ? (
                    <TrendingUp size={20} color="#2E7D32" />
                  ) : (
                    <TrendingDown size={20} color="#D32F2F" />
                  )}
                </View>

                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={styles.entryDesc}>{entry.description}</Text>
                  <View style={styles.entryMetaRow}>
                    <Text style={styles.entryCategory}>{entry.category}</Text>
                    <Text style={styles.entryDate}>• {entry.date}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.entryAmount,
                      entry.type === 'income' ? { color: '#2E7D32' } : { color: '#D32F2F' },
                    ]}
                  >
                    {entry.type === 'income' ? '+' : '-'}₱{entry.amount.toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteEntry(entry.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#9E9E9E" style={{ marginTop: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
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
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.white,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  netProfitCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  profitPositive: {
    backgroundColor: '#EAF5ED',
    borderColor: '#A8D7B2',
  },
  profitNegative: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  netProfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netProfitSub: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  netProfitValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E5E3A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  modalCard: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderColor: '#B2DFDB',
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  typeBtnExpense: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1.5,
    borderColor: '#EF5350',
  },
  typeBtnIncome: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: '#66BB6A',
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  catChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  catChip: {
    backgroundColor: '#F1F6F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDE9E0',
  },
  catChipActive: {
    backgroundColor: '#1E5E3A',
    borderColor: '#1E5E3A',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  catChipTextActive: {
    color: Colors.white,
  },
  amountInput: {
    backgroundColor: '#F5FAF6',
    borderWidth: 1.5,
    borderColor: '#D4E2D7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  descInput: {
    backgroundColor: '#F5FAF6',
    borderWidth: 1.5,
    borderColor: '#D4E2D7',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 14,
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#1E5E3A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  entriesList: {
    gap: 8,
  },
  entryCard: {
    padding: 12,
    backgroundColor: Colors.white,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryIncomeBox: {
    backgroundColor: '#E8F5E9',
  },
  entryExpenseBox: {
    backgroundColor: '#FFEBEE',
  },
  entryDesc: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryCategory: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  entryAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
