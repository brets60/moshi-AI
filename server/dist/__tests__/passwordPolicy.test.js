"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passwordPolicy_js_1 = require("../utils/passwordPolicy.js");
describe('Password Policy Enforcement', () => {
    test('rejects passwords shorter than 12 characters', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('Abc1!def2');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least 12 characters');
    });
    test('rejects passwords missing an uppercase letter', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('weakpassword123!@#');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one uppercase letter (A-Z)');
    });
    test('rejects passwords missing a lowercase letter', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('STRONGPASSWORD123!@#');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one lowercase letter (a-z)');
    });
    test('rejects passwords missing numbers', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('StrongPassword!@#$');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one number (0-9)');
    });
    test('rejects passwords missing special characters', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('StrongPassword1234');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least one special character (!@#$%^&*...)');
    });
    test('rejects passwords with leading or trailing spaces', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)(' AgriMate#2026Secure! ');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('No leading or trailing spaces');
    });
    test('accepts compliant strong passwords with full checklist met', () => {
        const result = (0, passwordPolicy_js_1.validatePasswordStrength)('AgriMate#2026Secure!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.strengthLabel).toBe('Very Strong');
        expect(result.score).toBeGreaterThanOrEqual(90);
        expect(result.rules.every((r) => r.met)).toBe(true);
    });
});
