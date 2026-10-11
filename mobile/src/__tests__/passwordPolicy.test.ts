import { describe, test } from 'node:test';
import assert from 'node:assert';
import { validatePasswordStrength } from '../utils/passwordPolicy';

describe('Mobile Password Strength & Requirements Checklist', () => {
  test('strictly enforces all 6 rules for AgriMate AI registration', () => {
    // Missing special character
    const noSpecial = validatePasswordStrength('AgriMate2026Secure');
    assert.strictEqual(noSpecial.isValid, false);
    assert.strictEqual(noSpecial.rules.find((r) => r.id === 'special')?.met, false);

    // Missing uppercase
    const noUpper = validatePasswordStrength('agrimate#2026secure!');
    assert.strictEqual(noUpper.isValid, false);
    assert.strictEqual(noUpper.rules.find((r) => r.id === 'uppercase')?.met, false);

    // Shorter than 12 characters
    const short = validatePasswordStrength('Short1!Ab');
    assert.strictEqual(short.isValid, false);
    assert.strictEqual(short.rules.find((r) => r.id === 'length')?.met, false);

    // Leading or trailing space
    const withSpace = validatePasswordStrength(' AgriMate#2026Secure! ');
    assert.strictEqual(withSpace.isValid, false);
    assert.strictEqual(withSpace.rules.find((r) => r.id === 'no_spaces')?.met, false);

    // Completely compliant strong password
    const valid = validatePasswordStrength('AgriMate#2026Secure!');
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.rules.every((r) => r.met), true);
    assert.ok(valid.score >= 90);
    assert.strictEqual(valid.strengthLabel, 'Very Strong');
  });
});
