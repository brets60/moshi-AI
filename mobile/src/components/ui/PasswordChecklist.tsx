import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { validatePasswordStrength, PasswordValidationResult } from '../../utils/passwordPolicy';
import { Colors, BorderRadius, Spacing } from '../../theme/colors';

interface PasswordChecklistProps {
  password?: string;
  showDetails?: boolean;
}

export const PasswordChecklist: React.FC<PasswordChecklistProps> = ({
  password = '',
  showDetails = true,
}) => {
  const result: PasswordValidationResult = validatePasswordStrength(password);

  const getStrengthBarColor = (): string => {
    if (result.score >= 90) return '#2E7D32'; // Strong forest green
    if (result.score >= 70) return '#4CAF50'; // Green
    if (result.score >= 45) return '#F57C00'; // Amber/Orange
    if (result.score >= 20) return '#E53935'; // Red
    return '#E0E0E0';
  };

  return (
    <View style={styles.container}>
      {/* Strength Bar & Score Header */}
      <View style={styles.headerRow}>
        <Text style={styles.strengthTitle}>Password Strength:</Text>
        <Text
          style={[
            styles.strengthBadge,
            { color: getStrengthBarColor() },
          ]}
        >
          {password.length === 0 ? 'Enter password' : result.strengthLabel}
        </Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.max(5, result.score)}%`,
              backgroundColor: getStrengthBarColor(),
            },
          ]}
        />
      </View>

      {/* Rules Checklist */}
      {showDetails && (
        <View style={styles.rulesList}>
          {result.rules.map((rule) => (
            <View key={rule.id} style={styles.ruleRow}>
              {rule.met ? (
                <CheckCircle2 size={16} color={Colors.success} style={styles.icon} />
              ) : (
                <Circle size={16} color={Colors.textMuted} style={styles.icon} />
              )}
              <Text
                style={[
                  styles.ruleText,
                  rule.met ? styles.ruleTextMet : styles.ruleTextPending,
                ]}
              >
                {rule.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F7F4',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E0EBE2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  strengthBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#DCE4DD',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  rulesList: {
    marginTop: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  icon: {
    marginRight: 8,
  },
  ruleText: {
    fontSize: 12,
  },
  ruleTextMet: {
    color: Colors.success,
    fontWeight: '600',
  },
  ruleTextPending: {
    color: Colors.textSecondary,
  },
});
