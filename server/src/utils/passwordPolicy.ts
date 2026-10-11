export interface PasswordValidationRule {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 100
  strengthLabel: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  rules: PasswordValidationRule[];
  errors: string[];
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const rules: PasswordValidationRule[] = [
    {
      id: 'length',
      label: 'At least 12 characters',
      met: (password || '').length >= 12,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      met: /[A-Z]/.test(password || ''),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      met: /[a-z]/.test(password || ''),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      met: /[0-9]/.test(password || ''),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*...)',
      met: /[^A-Za-z0-9]/.test(password || ''),
    },
    {
      id: 'no_spaces',
      label: 'No leading or trailing spaces',
      met: password === (password || '').trim() && (password || '').length > 0,
    },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const errors: string[] = [];
  rules.forEach((r) => {
    if (!r.met) errors.push(r.label);
  });

  // Calculate score 0-100
  let score = 0;
  if ((password || '').length >= 12) score += 30;
  else score += Math.min(25, (password || '').length * 2);

  if (/[A-Z]/.test(password || '')) score += 15;
  if (/[a-z]/.test(password || '')) score += 15;
  if (/[0-9]/.test(password || '')) score += 20;
  if (/[^A-Za-z0-9]/.test(password || '')) score += 20;
  if (password !== (password || '').trim()) score = Math.max(0, score - 30);

  let strengthLabel: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong' = 'Very Weak';
  if (score >= 90 && metCount === 6) strengthLabel = 'Very Strong';
  else if (score >= 75) strengthLabel = 'Strong';
  else if (score >= 50) strengthLabel = 'Fair';
  else if (score >= 25) strengthLabel = 'Weak';

  return {
    isValid: metCount === rules.length,
    score: Math.min(100, Math.max(0, score)),
    strengthLabel,
    rules,
    errors,
  };
}
