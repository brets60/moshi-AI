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
  Bug,
  Sprout,
  ShieldAlert,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';

interface PestItem {
  id: string;
  name: string;
  crop: string;
  symptoms: string;
  solution: string[];
  organicRemedy: string;
}

interface OrganicRecipe {
  id: string;
  title: string;
  purpose: string;
  ingredients: string[];
  instructions: string[];
  dosage: string;
}

const PESTS_DATA: PestItem[] = [
  {
    id: 'faw',
    name: 'Fall Armyworm (Harabas)',
    crop: '🌽 Mais (Corn)',
    symptoms: 'Butas-butas na dahon na may parang supot o pulbos na dumi sa gitnang talbos (whorl).',
    solution: [
      'Maghulog ng pinong abo ng kalan o buhangin sa gitnang buko ng mais sa umaga.',
      'Mag-spray ng Bacillus thuringiensis (Bt) o sili-bawang-sabong spray sa hapon.',
      'Gumamit ng Trichogramma cards mula sa DA / MAO.',
    ],
    organicRemedy: 'Abo ng Kalan + Sili-Bawang Spray',
  },
  {
    id: 'stem_borer',
    name: 'Rice Stem Borer (Aksip)',
    crop: '🌾 Palay (Rice)',
    symptoms: 'Patay na gitnang talbos (Deadheart) sa paglaki; maputing uhay na walang laman (Whitehead) sa pamumunga.',
    solution: [
      'Magpatubig at magpatuyo (AWD) upang maiwasan ang pangingitlog ng mariposa.',
      'Maglagay ng light traps sa paligid ng pinitak sa gabi upang mahuli ang mga paruparo.',
      'Huwag sumobra sa Urea dahil lumalambot ang tangkay at madaling pasukin ng uod.',
    ],
    organicRemedy: 'Light Traps + Balanseng Potash',
  },
  {
    id: 'fruit_borer',
    name: 'Fruit and Shoot Borer (FSB)',
    crop: '🍆 Talong (Eggplant)',
    symptoms: 'Lantang talbos na nakatungo; butas sa bunga na may lumalabas na dumi ng uod.',
    solution: [
      'Pitasin agad ang mga lantang talbos at bungang may butas at ibaon sa lupa.',
      'Mag-spray ng katas ng dahon ng kakawate (madre de cacao) at siling labuyo tuwing hapon.',
      'Magtanim ng marigold sa paligid bilang barrier crop.',
    ],
    organicRemedy: 'Pruning + Kakawate Spray',
  },
  {
    id: 'whitefly_curl',
    name: 'Leaf Curl Virus & Whiteflies',
    crop: '🍅 Kamatis at Sili',
    symptoms: 'Kulot at naninilaw na dahon; bansot na tangkay dulot ng maliliit na puting langaw.',
    solution: [
      'Maglagay ng Yellow Sticky Traps sa bawat 5 metrong distansya sa taniman.',
      'Mag-spray ng Sili-Bawang-Sabon spray tuwing 3 araw upang mapuksa ang mga whiteflies.',
      'Bunutin at ibaon ang lubhang stunted o bansot na halaman.',
    ],
    organicRemedy: 'Yellow Sticky Traps + Sabon Spray',
  },
  {
    id: 'bacterial_blight',
    name: 'Bacterial Leaf Blight (BLB)',
    crop: '🌾 Palay (Rice)',
    symptoms: 'Dilaw hanggang mapusyaw na guhit sa gilid ng dahon na nagiging kulay dayami o parang sunog.',
    solution: [
      'Bawasan ang paglalagay ng Nitroheno (Urea) at dagdagan ang Potassium (0-0-60).',
      'Mag-drain ng tubig sa pinitak upang hindi kumalat ang bacteria.',
      'Gumamit ng binhing lumalaban sa BLB (hal. Rc222, Rc216).',
    ],
    organicRemedy: 'Wood Ash Spray + Water Drainage',
  },
];

const ORGANIC_RECIPES: OrganicRecipe[] = [
  {
    id: 'calphos',
    title: 'CalPhos (Calcium Phosphate)',
    purpose: 'Pampatigas ng bulaklak at bunga; pampigil sa lagas ng bulaklak at blossom-end rot sa kamatis/talong.',
    ingredients: [
      '1 kilo Balat ng Itlog (hugasan at patuyuin)',
      '10 litro Sukang Tuba o Sukang Puti',
    ],
    instructions: [
      'I-ihaw o i-toast nang bahagya ang balat ng itlog sa kawali hanggang maging medyo brown.',
      'Durugin nang pino ang inihaw na balat ng itlog.',
      'Ilagay sa malinis na plastic container at buhusan ng suka (1 bahagi itlog sa 10 bahaging suka).',
      'Takpan ng manila paper at itali ng goma. Itago sa malilim na lugar sa loob ng 10 hanggang 14 na araw.',
    ],
    dosage: 'Ihalo ang 2 kutsara (30 mL) sa 1 litrong tubig. I-spray sa dahon at bulaklak linggu-linggo sa hapon.',
  },
  {
    id: 'fpj',
    title: 'FPJ (Fermented Plant Juice)',
    purpose: 'Organikong pampalago (Natural Growth Enhancer) na mayaman sa enzymes at hormones.',
    ingredients: [
      '1 kilo Talbos ng Kangkong o Kamote (anihin bago sumikat ang araw)',
      '1 kilo Molasses o Pulang Asukal (Muscovado)',
    ],
    instructions: [
      'Hiwain ang mga talbos nang mga 1 pulgada ang haba.',
      'Ihalo nang mabuti ang asukal sa mga hiniwang talbos.',
      'Ilagay sa timba at lagyan ng pabigat sa ibabaw para mapiga ang katas.',
      'Takpan ng papel at i-ferment sa loob ng 7 araw sa malilim na lugar.',
    ],
    dosage: '2 kutsara (30 mL) kada 16L knapsack sprayer. I-spray sa umaga tuwing 7-10 araw.',
  },
  {
    id: 'sili_bawang',
    title: 'Sili-Bawang-Sabon Insect Repellent',
    purpose: 'Mabisang organikong pamatay sa aphids, thrips, whiteflies, at maliliit na uod.',
    ingredients: [
      '10 pirasong Siling Labuyo',
      '5 butil ng Bawang',
      '1 kutsarang Liquid Dishwashing Soap',
      '1 litrong Tubig',
    ],
    instructions: [
      'Dikdikin o i-blender ang sili at bawang sa 1 basong tubig.',
      'Salain ang katas gamit ang malinis na tela.',
      'Ihalo ang nasala na katas sa 1 litrong tubig.',
      'Ihalo ang 1 kutsaritang sabon (nagsisilbing sticker at pampadulas sa balat ng insekto).',
    ],
    dosage: 'I-spray nang direkta sa ilalim ng dahon 2 beses sa isang linggo tuwing 4:30 PM.',
  },
];

export default function PestGuideScreen() {
  const [activeTab, setActiveTab] = useState<'pests' | 'recipes'>('pests');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPests = PESTS_DATA.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Bug size={26} color="#1E5E3A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Gabay sa Peste at Organikong Lunas</Text>
              <Text style={styles.heroSub}>
                Mabilisang pagkilala sa mga peste sa Pilipinas at libreng mga timpla mula sa kusina at bakuran.
              </Text>
            </View>
          </View>
        </Card>

        {/* Tab switch */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'pests' && styles.tabBtnActive]}
            onPress={() => setActiveTab('pests')}
          >
            <Bug size={16} color={activeTab === 'pests' ? Colors.white : Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabBtnText, activeTab === 'pests' && styles.tabBtnTextActive]}>
              Katalogo ng Peste ({PESTS_DATA.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recipes' && styles.tabBtnActive]}
            onPress={() => setActiveTab('recipes')}
          >
            <FlaskConical size={16} color={activeTab === 'recipes' ? Colors.white : Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.tabBtnText, activeTab === 'recipes' && styles.tabBtnTextActive]}>
              Organikong Timpla ({ORGANIC_RECIPES.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pest Catalog View */}
        {activeTab === 'pests' && (
          <View>
            {/* Search */}
            <View style={styles.searchBox}>
              <Search size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Maghanap ng peste (hal. Harabas, Aksip)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.cardList}>
              {filteredPests.map((pest) => (
                <Card key={pest.id} style={styles.pestCard}>
                  <View style={styles.pestHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pestName}>{pest.name}</Text>
                      <Text style={styles.pestCrop}>{pest.crop}</Text>
                    </View>
                    <View style={styles.organicPill}>
                      <Sparkles size={12} color="#1E5E3A" style={{ marginRight: 4 }} />
                      <Text style={styles.organicPillText}>{pest.organicRemedy}</Text>
                    </View>
                  </View>

                  <View style={styles.symptomBox}>
                    <AlertTriangle size={15} color="#D84315" style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={styles.symptomText}>
                      <b>Palatandaan:</b> {pest.symptoms}
                    </Text>
                  </View>

                  <Text style={styles.solutionHeader}>Mga Hakbang sa Pagsugpo:</Text>
                  {pest.solution.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <CheckCircle2 size={14} color="#2E7D32" style={{ marginRight: 6, marginTop: 2 }} />
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Organic Recipes View */}
        {activeTab === 'recipes' && (
          <View style={styles.cardList}>
            {ORGANIC_RECIPES.map((recipe) => (
              <Card key={recipe.id} style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                  <FlaskConical size={22} color="#1E5E3A" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={styles.recipePurpose}>{recipe.purpose}</Text>
                  </View>
                </View>

                {/* Ingredients */}
                <Text style={styles.recipeSubHeader}>Mga Sangkap:</Text>
                {recipe.ingredients.map((ing, i) => (
                  <Text key={i} style={styles.ingredientText}>
                    • {ing}
                  </Text>
                ))}

                {/* Instructions */}
                <Text style={styles.recipeSubHeader}>Paraan ng Paggawa:</Text>
                {recipe.instructions.map((ins, i) => (
                  <View key={i} style={styles.instructionRow}>
                    <Text style={styles.instructionNumber}>{i + 1}.</Text>
                    <Text style={styles.instructionText}>{ins}</Text>
                  </View>
                ))}

                {/* Dosage */}
                <View style={styles.dosageBox}>
                  <Sprout size={16} color="#0288D1" style={{ marginRight: 6 }} />
                  <Text style={styles.dosageText}>
                    <b>Tamang Gamit:</b> {recipe.dosage}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#1E5E3A',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
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
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  cardList: {
    gap: 12,
  },
  pestCard: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  pestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pestName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  pestCrop: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  organicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  organicPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E5E3A',
  },
  symptomBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8F6',
    borderColor: '#FFCCBC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  symptomText: {
    fontSize: 12,
    color: '#3E2723',
    lineHeight: 16,
    flex: 1,
  },
  solutionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#37474F',
    lineHeight: 16,
    flex: 1,
  },
  recipeCard: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E5E3A',
  },
  recipePurpose: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recipeSubHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 12,
    color: '#455A64',
    lineHeight: 18,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  instructionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 6,
    width: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#37474F',
    lineHeight: 17,
    flex: 1,
  },
  dosageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderColor: '#BBDEFB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  dosageText: {
    fontSize: 12,
    color: '#0D47A1',
    lineHeight: 16,
    flex: 1,
  },
});
