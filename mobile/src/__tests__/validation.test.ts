import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  registrationSchema,
  loginSchema,
  cropFormSchema,
  taskFormSchema,
} from '../utils/validation';

describe('Mobile Input Validation & Zod Schemas', () => {
  describe('Registration Form Schema', () => {
    test('accepts valid registration data meeting all password requirements', () => {
      const validData = {
        full_name: 'Maria Santos',
        email: 'maria@farm.org',
        password: 'AgriMate#2026Secure!',
        confirm_password: 'AgriMate#2026Secure!',
        agree_to_terms: true,
        farm_name: 'Green Horizon Farm',
        farm_location: 'Central Valley',
      };

      const result = registrationSchema.safeParse(validData);
      assert.strictEqual(result.success, true);
    });

    test('rejects registration when password and confirmation mismatch', () => {
      const mismatchedData = {
        full_name: 'Maria Santos',
        email: 'maria@farm.org',
        password: 'AgriMate#2026Secure!',
        confirm_password: 'DifferentPassword123!',
        agree_to_terms: true,
      };

      const result = registrationSchema.safeParse(mismatchedData);
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.issues[0].message.includes('Passwords do not match'));
      }
    });

    test('rejects registration without terms agreement', () => {
      const noTermsData = {
        full_name: 'Maria Santos',
        email: 'maria@farm.org',
        password: 'AgriMate#2026Secure!',
        confirm_password: 'AgriMate#2026Secure!',
        agree_to_terms: false,
      };

      const result = registrationSchema.safeParse(noTermsData);
      assert.strictEqual(result.success, false);
    });
  });

  describe('Login Form Schema', () => {
    test('validates correct email format', () => {
      assert.strictEqual(loginSchema.safeParse({ email: 'farmer@crop.com', password: 'secret' }).success, true);
      assert.strictEqual(loginSchema.safeParse({ email: 'invalid-email', password: 'secret' }).success, false);
      assert.strictEqual(loginSchema.safeParse({ email: '', password: 'secret' }).success, false);
    });
  });

  describe('Crop Form Schema', () => {
    test('validates minimum crop requirements and defaults', () => {
      const validCrop = {
        crop_name: 'San Marzano Tomatoes',
        plot_size: '2.5',
      };

      const result = cropFormSchema.safeParse(validCrop);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.plot_size, 2.5);
        assert.strictEqual(result.data.growth_stage, 'Seedling');
        assert.strictEqual(result.data.status, 'Active');
      }
    });
  });

  describe('Task Form Schema', () => {
    test('validates task requirements and types', () => {
      const validTask = {
        title: 'Morning Drip Irrigation',
        task_type: 'Watering',
        scheduled_at: '2026-03-20T08:00:00Z',
      };

      const result = taskFormSchema.safeParse(validTask);
      assert.strictEqual(result.success, true);
      if (result.success) {
        assert.strictEqual(result.data.priority, 'Medium');
      }
    });
  });
});
