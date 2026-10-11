import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Button
            title="Back to Login"
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={18} color={Colors.primary} />}
            onPress={() => router.back()}
            style={styles.backBtn}
          />

          <View style={styles.card}>
            {submitted ? (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={48} color={Colors.success} />
                </View>
                <Text style={styles.title}>Recovery Link Sent</Text>
                <Text style={styles.successText}>
                  If an account exists for <Text style={{ fontWeight: '700' }}>{email}</Text>, a secure password reset link has been dispatched to your inbox.
                </Text>
                <Button
                  title="Return to Login"
                  variant="primary"
                  size="lg"
                  onPress={() => router.replace('/(auth)/login')}
                  style={{ width: '100%', marginTop: Spacing.lg }}
                />
              </View>
            ) : (
              <>
                <Text style={styles.title}>Reset Your Password</Text>
                <Text style={styles.subtitle}>
                  Enter your account email and we'll send you a verified recovery link to regain access.
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Input
                  label="Email Address"
                  placeholder="e.g. maria@farm.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon={<Mail size={20} color={Colors.textSecondary} />}
                />

                <Button
                  title="Send Reset Instructions"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onPress={handleSubmit}
                  style={styles.submitBtn}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
