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
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Generic secure error message
      setErrorMessage(
        'Invalid email or password. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Sprout size={36} color={Colors.white} />
            </View>
            <Text style={styles.title}>Welcome to AgriMate</Text>
            <Text style={styles.subtitle}>Log in to manage your crops and farming schedules</Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <AlertCircle size={20} color={Colors.error} style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="e.g. maria@farm.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={20} color={Colors.textSecondary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={20} color={Colors.textSecondary} />}
            />

            <View style={styles.forgotRow}>
              <Button
                title="Forgot Password?"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(auth)/forgot-password')}
              />
            </View>

            <Button
              title="Log In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              style={styles.loginBtn}
            />

            <Button
              title="🌾 Mabilisang Pagsubok (1-Tap Demo Login)"
              variant="outline"
              size="lg"
              loading={loading}
              onPress={async () => {
                setLoading(true);
                try {
                  await login('saidimar.farmer@agrimate.local', 'Password#2026!');
                  router.replace('/(tabs)');
                } catch (err: any) {
                  setErrorMessage(err.message || 'Login failed.');
                } finally {
                  setLoading(false);
                }
              }}
              style={{ marginTop: 10 }}
            />

            <View style={styles.registerPrompt}>
              <Text style={styles.promptText}>New to AgriMate? </Text>
              <Button
                title="Create an Account"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(auth)/register')}
              />
            </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2EE',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  loginBtn: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  promptText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
