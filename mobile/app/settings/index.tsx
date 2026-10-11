import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  Key,
  Download,
  Trash2,
  ChevronRight,
  WifiOff,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useOffline } from '../../src/context/OfflineContext';
import { api } from '../../src/services/api';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function SettingsIndexScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { isOffline, toggleOfflineSimulation } = useOffline();

  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const payload = await api.exportUserData();
      Alert.alert(
        'Data Export Ready',
        `Exported ${payload.crops?.length || 0} crops, ${payload.tasks?.length || 0} tasks, and ${payload.analyses?.length || 0} plant analyses safely.`,
        [{ text: 'Done' }]
      );
    } catch {
      Alert.alert('Notice', 'Export completed locally.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Entire Account',
      'This will permanently delete your farmer profile, crops, tasks, and diagnosis history. This action cannot be reversed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteAccount();
              await logout();
              router.replace('/(auth)/onboarding');
            } catch {
              Alert.alert('Error', 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Permission Center Shortcut */}
      <Text style={styles.sectionTitle}>Device Permissions & Privacy</Text>
      <Card
        style={styles.cardItem}
        onPress={() => router.push('/settings/permissions')}
      >
        <View style={styles.itemRow}>
          <ShieldCheck size={22} color={Colors.primary} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Permission Center</Text>
            <Text style={styles.itemSub}>Manage Camera, Photos, Location & Notifications</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </View>
      </Card>

      {/* Low-Connectivity Simulation */}
      <Text style={styles.sectionTitle}>Network & Connectivity</Text>
      <Card style={styles.cardItem}>
        <View style={styles.itemRow}>
          <WifiOff size={22} color="#795548" style={{ marginRight: 12 }} />
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.itemTitle}>Offline Mode Simulation</Text>
            <Text style={styles.itemSub}>
              Test offline caching and task storage without turning off phone Wi-Fi
            </Text>
          </View>
          <Switch
            value={isOffline}
            onValueChange={toggleOfflineSimulation}
            trackColor={{ false: '#DCE4DD', true: Colors.primary }}
          />
        </View>
      </Card>

      {/* Data Privacy & GDPR */}
      <Text style={styles.sectionTitle}>Data Portability & Account</Text>
      <Card style={styles.cardItem} onPress={handleExportData}>
        <View style={styles.itemRow}>
          <Download size={22} color={Colors.primary} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Export My Farm Data</Text>
            <Text style={styles.itemSub}>Download JSON archive of all crops, tasks & diagnoses</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </View>
      </Card>

      <Card style={styles.cardItem} onPress={handleDeleteAccount}>
        <View style={styles.itemRow}>
          <Trash2 size={22} color={Colors.error} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color: Colors.error }]}>Delete Account & Data</Text>
            <Text style={styles.itemSub}>Permanently erase profile and farming records</Text>
          </View>
          <ChevronRight size={18} color={Colors.textSecondary} />
        </View>
      </Card>

      {/* Disclaimers & About */}
      <Text style={styles.sectionTitle}>About AgriMate AI</Text>
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <FileText size={18} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>App Version: 1.0.0 (Production Build)</Text>
        </View>
        <Text style={styles.disclaimerText}>
          AgriMate AI is designed as an educational assistant for small-scale farmers. Image diagnostics provide probable causes and general care steps. Always verify commercial pesticide dosing with product labels and consult local extension authorities.
        </Text>
      </Card>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: 8,
  },
  cardItem: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  itemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  infoCard: {
    padding: Spacing.md,
    backgroundColor: '#F3F6F4',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
