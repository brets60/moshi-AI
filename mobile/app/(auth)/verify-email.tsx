import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Button } from '../../src/components/ui/Button';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email, name } = useLocalSearchParams<{ email: string; name: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <CheckCircle2 size={56} color={Colors.success} />
        </View>

        <Text style={styles.title}>Welcome, {name || 'Farmer'}!</Text>
        <Text style={styles.subtitle}>Your AgriMate AI account is verified and ready.</Text>

        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>Registered Email:</Text>
          <Text style={styles.emailValue}>{email || 'Your farm account'}</Text>
        </View>

        <View style={styles.noticeBox}>
          <ShieldCheck size={20} color={Colors.primary} style={{ marginRight: 10 }} />
          <Text style={styles.noticeText}>
            Your farm data is secured with encrypted credentials and private cloud storage.
          </Text>
        </View>

        <Button
          title="Enter AgriMate Dashboard"
          variant="primary"
          size="lg"
          icon={<ArrowRight size={20} color={Colors.white} />}
          onPress={() => router.replace('/(tabs)')}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  emailCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  noticeText: {
    fontSize: 13,
    color: Colors.primaryDark,
    flex: 1,
    lineHeight: 18,
  },
  continueBtn: {
    width: '100%',
  },
});
