import { z } from 'zod';
import { validatePasswordStrength } from './passwordPolicy';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address (e.g., farmer@example.com)'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registrationSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Please enter your full name (at least 2 characters)'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .refine(
        (val) => validatePasswordStrength(val).isValid,
        {
          message:
            'Password must include uppercase, lowercase, number, special character, and no leading/trailing spaces.',
        }
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    agree_to_terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service and Privacy Policy to continue' }),
    }),
    // Optional farming fields
    farm_name: z.string().trim().optional(),
    farm_location: z.string().trim().optional(),
    preferred_language: z.string().default('en'),
    crops_grown: z.string().trim().optional(),
    farming_experience: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match. Please ensure both fields are identical.',
    path: ['confirm_password'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const cropFormSchema = z.object({
  crop_name: z.string().trim().min(2, 'Crop name is required (e.g. Tomatoes, Maize)'),
  variety: z.string().trim().optional(),
  farm_name: z.string().trim().optional(),
  planting_date: z.string().optional(),
  expected_harvest_date: z.string().optional(),
  plot_size: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), 'Plot size must be a number')
    .transform((v) => (v ? parseFloat(v) : undefined)),
  plot_size_unit: z.enum(['acres', 'hectares', 'sq_meters', 'plots']).default('acres'),
  growth_stage: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity / Harvest']).default('Seedling'),
  status: z.enum(['Active', 'Harvested', 'Archived']).default('Active'),
  notes: z.string().trim().optional(),
});

export type CropFormData = z.infer<typeof cropFormSchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Task title is required (e.g. Morning Irrigation)'),
  crop_id: z.string().optional(),
  crop_name: z.string().optional(),
  task_type: z.enum([
    'Watering',
    'Fertilizing',
    'Pest inspection',
    'Crop monitoring',
    'Planting',
    'Harvesting',
    'General',
  ]),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  scheduled_at: z.string().min(1, 'Scheduled date and time is required'),
  description: z.string().trim().optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
