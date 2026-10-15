import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  DollarSign,
  ShieldCheck,
  Calendar,
  Info,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';

interface CommodityPrice {
  id: string;
  name: string;
  category: 'butil' | 'gulay';
  unit: string;
  farmgatePrice: number;
  retailPrice: number;
  trend: 'up' | 'down' | 'stable';
  trendNote: string;
  advice: string;
}

const COMMODITIES: CommodityPrice[] = [
  {
    id: 'palay_dry',
    name: 'Palay (Tuyo / Clean & Dry 14% MC)',
    category: 'butil',
    unit: 'kilo',
    farmgatePrice: 23.5,
    retailPrice: 52.0,
    trend: 'up',
    trendNote: '+₱1.50 kumpara noong nakaraang linggo',
    advice: 'Magandang ibenta ngayon. Mataas ang demand ng mga miller.',
  },
  {
    id: 'palay_wet',
    name: 'Palay (Sariwa / Basa mula Harvester)',
    category: 'butil',
    unit: 'kilo',
    farmgatePrice: 17.5,
    retailPrice: 48.0,
    trend: 'stable',
    trendNote: 'Matatag ang presyo sa rehiyon',
    advice: 'Kung may bilaran o solar dryer, patuyuin muna upang tumaas ng ₱5-₱6 kada kilo.',
  },
  {
    id: 'corn_yellow',
    name: 'Mais (Yellow Corn Grain / Pang-feed)',
    category: 'butil',
    unit: 'kilo',
    farmgatePrice: 20.0,
    retailPrice: 28.0,
    trend: 'up',
    trendNote: 'Mataas ang pangangailangan ng feed mills',
    advice: 'Siguraduhing tuyo (14% MC) upang maiwasan ang aflatoxin at bawas-presyo.',
  },
  {
    id: 'corn_white',
    name: 'Mais (White Corn / Mais-Bigas)',
    category: 'butil',
    unit: 'kilo',
    farmgatePrice: 24.0,
    retailPrice: 34.0,
    trend: 'stable',
    trendNote: 'Patuloy ang maayos na bentahan',
    advice: 'I-direkta sa lokal na palengke para sa mas magandang tubo.',
  },
  {
    id: 'kamatis',
    name: 'Kamatis (Tomato)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 45.0,
    retailPrice: 65.0,
    trend: 'down',
    trendNote: '-₱5.00 dahil sa sabay-sabay na anihan',
    advice: 'Pitasin sa tamang kulay (breaker stage) upang hindi mabilis mabulok sa biyahe.',
  },
  {
    id: 'talong',
    name: 'Talong (Eggplant)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 55.0,
    retailPrice: 75.0,
    trend: 'up',
    trendNote: '+₱5.00 dahil sa limitadong suplay',
    advice: 'Piliin ang makikintab at walang butas ng borer para sa Class A presyo.',
  },
  {
    id: 'sili_labuyo',
    name: 'Siling Labuyo (Hot Chili)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 140.0,
    retailPrice: 200.0,
    trend: 'up',
    trendNote: 'Mataas ang demand sa mga pamilihan',
    advice: 'Panatilihing sariwa sa malilim na lugar bago i-deliver.',
  },
  {
    id: 'sibuyas_pula',
    name: 'Sibuyas Pula (Red Onion)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 85.0,
    retailPrice: 120.0,
    trend: 'stable',
    trendNote: 'Sapat ang suplay sa mga cold storage',
    advice: 'Siguraduhing tuyo ang leeg ng sibuyas bago ibenta upang maiwasan ang bulok.',
  },
  {
    id: 'bawang',
    name: 'Bawang (Native Garlic)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 120.0,
    retailPrice: 160.0,
    trend: 'stable',
    trendNote: 'Matatag ang bilihan',
    advice: 'I-bundle nang maayos para mas mabilis mabili sa palengke.',
  },
  {
    id: 'kalabasa',
    name: 'Kalabasa (Squash)',
    category: 'gulay',
    unit: 'kilo',
    farmgatePrice: 28.0,
    retailPrice: 40.0,
    trend: 'stable',
    trendNote: 'Tuloy-tuloy ang bilihan',
    advice: 'Mag-ani kapag magulang na ang tangkay upang tumagal ang shelf-life.',
  },
];

export default function MarketPricesScreen() {
  const [selectedRegion, setSelectedRegion] = useState<'luzon' | 'visayas' | 'mindanao'>('luzon');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'butil' | 'gulay'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = COMMODITIES.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <DollarSign size={26} color="#1E5E3A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Bantay Presyo ng Ani</Text>
              <Text style={styles.heroSub}>
                Tinatayang Farmgate at Retail Prices batay sa DA Price Monitoring upang hindi ma-barat ang iyong ani.
              </Text>
            </View>
          </View>
        </Card>

        {/* Region Selector */}
        <View style={styles.regionRow}>
          <TouchableOpacity
            style={[styles.regionChip, selectedRegion === 'luzon' && styles.regionChipActive]}
            onPress={() => setSelectedRegion('luzon')}
          >
            <Text style={[styles.regionText, selectedRegion === 'luzon' && styles.regionTextActive]}>
              🇵🇭 Luzon
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.regionChip, selectedRegion === 'visayas' && styles.regionChipActive]}
            onPress={() => setSelectedRegion('visayas')}
          >
            <Text style={[styles.regionText, selectedRegion === 'visayas' && styles.regionTextActive]}>
              🏝️ Visayas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.regionChip, selectedRegion === 'mindanao' && styles.regionChipActive]}
            onPress={() => setSelectedRegion('mindanao')}
          >
            <Text style={[styles.regionText, selectedRegion === 'mindanao' && styles.regionTextActive]}>
              🌄 Mindanao
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Maghanap ng pananim (hal. Palay, Kamatis)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              Lahat ({COMMODITIES.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'butil' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('butil')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'butil' && styles.filterTabTextActive]}>
              🌾 Palay at Mais
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'gulay' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('gulay')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'gulay' && styles.filterTabTextActive]}>
              🍅 Mga Gulay
            </Text>
          </TouchableOpacity>
        </View>

        {/* Price List */}
        <View style={styles.priceList}>
          {filteredItems.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemTrendNote}>{item.trendNote}</Text>
                </View>
                <View
                  style={[
                    styles.trendBadge,
                    item.trend === 'up'
                      ? styles.trendUp
                      : item.trend === 'down'
                      ? styles.trendDown
                      : styles.trendStable,
                  ]}
                >
                  {item.trend === 'up' ? (
                    <TrendingUp size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                  ) : item.trend === 'down' ? (
                    <TrendingDown size={14} color="#D32F2F" style={{ marginRight: 4 }} />
                  ) : (
                    <Minus size={14} color="#F57C00" style={{ marginRight: 4 }} />
                  )}
                  <Text
                    style={[
                      styles.trendText,
                      item.trend === 'up'
                        ? { color: '#2E7D32' }
                        : item.trend === 'down'
                        ? { color: '#D32F2F' }
                        : { color: '#F57C00' },
                    ]}
                  >
                    {item.trend === 'up' ? 'Tumataas' : item.trend === 'down' ? 'Bumababa' : 'Matatag'}
                  </Text>
                </View>
              </View>

              {/* Price Figures */}
              <View style={styles.priceRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Farmgate (Bilihan sa Bukid)</Text>
                  <Text style={styles.farmgateValue}>
                    ₱{item.farmgatePrice.toFixed(2)}{' '}
                    <Text style={styles.priceUnit}>/ {item.unit}</Text>
                  </Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>Retail (Presyo sa Palengke)</Text>
                  <Text style={styles.retailValue}>
                    ₱{item.retailPrice.toFixed(2)}{' '}
                    <Text style={styles.priceUnit}>/ {item.unit}</Text>
                  </Text>
                </View>
              </View>

              {/* Practical Selling Advice */}
              <View style={styles.adviceRow}>
                <Info size={14} color="#1E5E3A" style={{ marginRight: 6, marginTop: 2 }} />
                <Text style={styles.adviceText}>{item.advice}</Text>
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
  heroCard: {
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
  regionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  regionChip: {
    flex: 1,
    backgroundColor: '#EDF3EE',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E8DC',
  },
  regionChipActive: {
    backgroundColor: '#1E5E3A',
    borderColor: '#1E5E3A',
  },
  regionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  regionTextActive: {
    color: Colors.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#DDE7E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: Colors.white,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },
  priceList: {
    gap: 10,
  },
  itemCard: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  itemTrendNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  trendUp: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  trendDown: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FFCDD2',
  },
  trendStable: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: '#F5FAF6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    backgroundColor: '#DDE9E0',
    marginHorizontal: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  farmgateValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E5E3A',
  },
  retailValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#455A64',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EDF6EF',
    padding: 8,
    borderRadius: 8,
  },
  adviceText: {
    fontSize: 12,
    color: '#284630',
    lineHeight: 16,
    flex: 1,
  },
});
