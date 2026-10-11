import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  AlertCircle,
  MapPin,
  Tractor,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { PasswordChecklist } from '../../src/components/ui/PasswordChecklist';
import { validatePasswordStrength } from '../../src/utils/passwordPolicy';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Required Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Optional Profile Fields
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [cropsGrown, setCropsGrown] = useState('');
  const [experience, setExperience] = useState('Beginner (< 2 years)');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    // 1. Basic required validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name (Paki-lagay ang iyong buong pangalan).');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address (hal. saidimar@gmail.com).');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    // 2. Strict password strength check
    const pwdValidation = validatePasswordStrength(password);
    if (!pwdValidation.isValid) {
      setErrorMessage(
        'Kailangan ng password ang hindi bababa sa 12 letra/numero na may Malaking Titik, Maliit na Titik, Numero, at Simbolo (o pindutin ang "Gamitin ang Mabilis na Password" sa ibaba).'
      );
      scrollViewRef.current?.scrollTo({ y: 140, animated: true });
      return;
    }

    // 3. Confirm password matching
    if (password !== confirmPassword) {
      setErrorMessage('Hindi magkatugma ang password at kumpirmasyon (Passwords do not match).');
      scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      return;
    }

    // 4. Terms agreement check
    if (!agreedToTerms) {
      setErrorMessage('Paki-lagyan ng tsek ang kasunduan sa Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
        agree_to_terms: true as const,
        farm_name: farmName.trim() || undefined,
        farm_location: farmLocation.trim() || undefined,
        crops_grown: cropsGrown.trim() || undefined,
        farming_experience: experience,
        preferred_language: 'tl',
      });

      // Move to tabs / dashboard
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Unable to complete registration. Please check your network and try again.'
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
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Farmer Account</Text>
            <Text style={styles.subtitle}>
              Sumali sa AgriMate AI para sa matalinong pag-aalaga ng pananim
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <AlertCircle size={20} color={Colors.error} style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.form}>
            {/* Required Fields Section */}
            <Input
              label="Full Name *"
              placeholder="e.g. Saidimar Rey"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              helperText="Walang limitasyon sa letra — anumang pangalan ay tinatanggap"
              leftIcon={<User size={20} color={Colors.textSecondary} />}
            />

            <Input
              label="Email Address *"
              placeholder="e.g. saidimar@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Mail size={20} color={Colors.textSecondary} />}
            />

            <Input
              label="Password *"
              placeholder="Create a strong password"
              isPassword
              value={password}
              onChangeText={setPassword}
              leftIcon={<Lock size={20} color={Colors.textSecondary} />}
            />

            {/* Quick 1-Tap Password Helper */}
            <TouchableOpacity
              style={styles.samplePwdBtn}
              activeOpacity={0.7}
              onPress={() => {
                const validSample = 'AgriMate#2026!';
                setPassword(validSample);
                setConfirmPassword(validSample);
                setErrorMessage(null);
              }}
            >
              <Sparkles size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.samplePwdText}>✨ Gamitin ang Mabilis na Password (AgriMate#2026!)</Text>
            </TouchableOpacity>

            {/* Real-time Checklist & Strength Meter */}
            <PasswordChecklist password={password} />

            <Input
              label="Confirm Password *"
              placeholder="Re-enter your password"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={20} color={Colors.textSecondary} />}
            />

            {/* Terms and Privacy Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms ? (
                <CheckSquare size={22} color={Colors.primary} />
              ) : (
                <Square size={22} color={Colors.textMuted} />
              )}
              <Text style={styles.termsText}>
                Sumasang-ayon ako sa{' '}
                <Text style={styles.termsHighlight}>Terms of Service</Text> at{' '}
                <Text style={styles.termsHighlight}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {/* Optional Farm Profile Accordion */}
            <TouchableOpacity
              style={styles.accordionHeader}
              activeOpacity={0.8}
              onPress={() => setShowOptionalFields(!showOptionalFields)}
            >
              <View style={styles.accordionTitleRow}>
                <Tractor size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.accordionTitle}>Opsyonal na Detalye ng Sakahan</Text>
              </View>
              {showOptionalFields ? (
                <ChevronUp size={20} color={Colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>

            {showOptionalFields && (
              <View style={styles.optionalBox}>
                <Text style={styles.optionalHint}>
                  Makatutulong ito sa pagbibigay ng mas angkop na payo sa pagsasaka, ngunit hindi kinakailangan upang gumawa ng account.
                </Text>

                <Input
                  label="Pangalan ng Sakahan (Opsyonal)"
                  placeholder="e.g. Aking Sakahan"
                  value={farmName}
                  onChangeText={setFarmName}
                />

                <Input
                  label="Lokasyon ng Sakahan (Opsyonal)"
                  placeholder="e.g. Davao, Philippines"
                  value={farmLocation}
                  onChangeText={setFarmLocation}
                  leftIcon={<MapPin size={20} color={Colors.textSecondary} />}
                />

                <Input
                  label="Mga Pananim (Opsyonal)"
                  placeholder="e.g. Palay, Kamatis, Mais"
                  value={cropsGrown}
                  onChangeText={setCropsGrown}
                />
              </View>
            )}

            {/* Second Error Box right above Submit Button so it is immediately visible */}
            {errorMessage && (
              <View style={[styles.errorBox, { marginTop: 12, marginBottom: 4 }]}>
                <AlertCircle size={20} color={Colors.error} style={styles.errorIcon} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Button
              title="Gumawa ng Account (Create Account)"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
              style={styles.submitBtn}
            />

            <Button
              title="🌾 Mabilisang Pagsubok (1-Tap Test Demo)"
              variant="outline"
              size="lg"
              loading={loading}
              onPress={async () => {
                setLoading(true);
                try {
                  await register({
                    full_name: fullName.trim() || 'Saidimar Rey',
                    email: email.trim().toLowerCase() || 'saidimar.farmer@agrimate.local',
                    password: 'Password#2026!',
                    confirm_password: 'Password#2026!',
                    agree_to_terms: true as const,
                    farm_name: farmName.trim() || 'Aking Sakahan',
                    farm_location: farmLocation.trim() || 'Pilipinas',
                    crops_grown: cropsGrown.trim() || 'Palay at Gulay',
                    farming_experience: experience,
                    preferred_language: 'tl',
                  });
                  router.replace('/(tabs)');
                } catch (err: any) {
                  setErrorMessage(err.message || 'Demo access failed');
                } finally {
                  setLoading(false);
                }
              }}
              style={{ marginTop: 10 }}
            />

            <View style={styles.loginPrompt}>
              <Text style={styles.promptText}>May account ka na ba? </Text>
              <Button
                title="Mag-log In"
                variant="ghost"
                size="sm"
                onPress={() => router.push('/(auth)/login')}
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  termsHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEEEB',
    marginTop: 4,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  optionalBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  optionalHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  submitBtn: {
    width: '100%',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  promptText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  samplePwdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5ED',
    borderWidth: 1,
    borderColor: '#C5E0CB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  samplePwdText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
