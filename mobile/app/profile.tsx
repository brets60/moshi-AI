import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  MapPin,
  Tractor,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/services/api';
import { Colors, BorderRadius, Spacing } from '../src/theme/colors';
import { Card } from '../src/components/ui/Card';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Farmer');
  const [farmName, setFarmName] = useState(user?.farm_name || 'My Family Farm');
  const [farmLocation, setFarmLocation] = useState(user?.farm_location || 'Central Valley');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await api.updateProfile({
        full_name: fullName.trim(),
        farm_name: farmName.trim(),
        farm_location: farmLocation.trim(),
        preferred_language: language,
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of AgriMate AI?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.avatarCard}>
        <View style={styles.avatarCircle}>
          <User size={44} color={Colors.primary} />
        </View>
        <Text style={styles.profileName}>{user?.full_name || 'Farmer'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'farmer@agrimate.local'}</Text>
      </Card>

      {success && (
        <View style={styles.successBanner}>
          <CheckCircle2 size={18} color={Colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.successText}>Profile changes saved successfully!</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Farmer & Farm Information</Text>
      <Card style={styles.formCard}>
        <Input
          label="Farmer Full Name"
          value={fullName}
          onChangeText={setFullName}
          leftIcon={<User size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Farm / Plot Name"
          value={farmName}
          onChangeText={setFarmName}
          leftIcon={<Tractor size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Farm Region / City"
          value={farmLocation}
          onChangeText={setFarmLocation}
          leftIcon={<MapPin size={18} color={Colors.textSecondary} />}
        />

        <Input
          label="Preferred Language (e.g. en, es, tl)"
          value={language}
          onChangeText={setLanguage}
        />

        <Button
          title="Save Profile Updates"
          variant="primary"
          size="lg"
          loading={saving}
          icon={<Save size={18} color={Colors.white} />}
          onPress={handleSave}
          style={{ marginTop: Spacing.sm }}
        />
      </Card>

      <Button
        title="Log Out of Account"
        variant="danger"
        size="md"
        icon={<LogOut size={18} color={Colors.white} />}
        onPress={handleLogout}
        style={{ marginTop: Spacing.lg }}
      />
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
  avatarCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  formCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
});
