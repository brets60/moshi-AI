-- ============================================================================
-- AGRIMATE AI — Comprehensive Relational Database Schema & RLS Policies
-- Compatible with Supabase PostgreSQL and Supabase Authentication
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLES DEFINITION
-- ============================================================================

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en' NOT NULL,
    farm_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    variety TEXT,
    planting_date DATE,
    expected_harvest_date DATE,
    plot_size NUMERIC(10, 2),
    plot_size_unit TEXT DEFAULT 'acres' NOT NULL,
    growth_stage TEXT DEFAULT 'Seedling' NOT NULL,
    status TEXT DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Harvested', 'Archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Farming Tasks Table
CREATE TABLE IF NOT EXISTS public.farming_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL CHECK (task_type IN (
        'Watering', 'Fertilizing', 'Pest inspection', 
        'Crop monitoring', 'Planting', 'Harvesting', 'General'
    )),
    priority TEXT DEFAULT 'Medium' NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Plant Analyses Table (Image-based AI Diagnostics)
CREATE TABLE IF NOT EXISTS public.plant_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    private_image_path TEXT NOT NULL,
    crop_identification TEXT NOT NULL,
    symptoms TEXT,
    possible_causes TEXT,
    recommendations TEXT,
    uncertainty_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- AI Conversations Table (Chat sessions)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- AI Messages Table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Weather Cache Table (Reduces redundant API calls across farm regions)
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_key TEXT NOT NULL UNIQUE,
    weather_payload JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' NOT NULL CHECK (theme IN ('light', 'dark', 'system')),
    preferred_language TEXT DEFAULT 'en' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    weather_location_preference JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_crops_status ON public.crops(status);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_user_id ON public.farming_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_crop_id ON public.farming_tasks(crop_id);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_scheduled ON public.farming_tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_farming_tasks_status ON public.farming_tasks(status);
CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_id ON public.plant_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_weather_cache_key ON public.weather_cache(location_key);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON public.weather_cache(expires_at);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 4.2 Farms policies
CREATE POLICY "Users can view their own farms" 
    ON public.farms FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farms" 
    ON public.farms FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms" 
    ON public.farms FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms" 
    ON public.farms FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.3 Crops policies
CREATE POLICY "Users can view their own crops" 
    ON public.crops FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crops" 
    ON public.crops FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops" 
    ON public.crops FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops" 
    ON public.crops FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.4 Farming Tasks policies
CREATE POLICY "Users can view their own tasks" 
    ON public.farming_tasks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
    ON public.farming_tasks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
    ON public.farming_tasks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
    ON public.farming_tasks FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.5 Plant Analyses policies
CREATE POLICY "Users can view their own plant analyses" 
    ON public.plant_analyses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plant analyses" 
    ON public.plant_analyses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plant analyses" 
    ON public.plant_analyses FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.6 AI Conversations policies
CREATE POLICY "Users can view their own conversations" 
    ON public.ai_conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
    ON public.ai_conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
    ON public.ai_conversations FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
    ON public.ai_conversations FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.7 AI Messages policies
CREATE POLICY "Users can view messages from their conversations" 
    ON public.ai_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE public.ai_conversations.id = public.ai_messages.conversation_id
            AND public.ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages into their conversations" 
    ON public.ai_messages FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE public.ai_conversations.id = public.ai_messages.conversation_id
            AND public.ai_conversations.user_id = auth.uid()
        )
    );

-- 4.8 Weather Cache policies (readable by authenticated users, manageable by service role)
CREATE POLICY "Authenticated users can read cached weather" 
    ON public.weather_cache FOR SELECT 
    TO authenticated 
    USING (true);

-- 4.9 User Settings policies
CREATE POLICY "Users can view their settings" 
    ON public.user_settings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their settings" 
    ON public.user_settings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their settings" 
    ON public.user_settings FOR UPDATE 
    USING (auth.uid() = user_id);

-- ============================================================================
-- 5. AUTOMATED TRIGGER FOR USER REGISTRATION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default profile
    INSERT INTO public.profiles (id, full_name, preferred_language, farm_name)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Farmer'),
        COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
        new.raw_user_meta_data->>'farm_name'
    );

    -- Create default settings
    INSERT INTO public.user_settings (user_id, theme, preferred_language, notifications_enabled)
    VALUES (
        new.id,
        'light',
        COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
        true
    );

    -- Optionally create default farm if provided
    IF new.raw_user_meta_data->>'farm_name' IS NOT NULL AND new.raw_user_meta_data->>'farm_location' IS NOT NULL THEN
        INSERT INTO public.farms (user_id, name, location_name)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'farm_name',
            new.raw_user_meta_data->>'farm_location'
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 6. STORAGE BUCKET CONFIGURATION (Private plant photos)
-- ============================================================================
-- Note: Insert bucket definition into Supabase storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'plant-photos', 
    'plant-photos', 
    false, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can only upload and view their own private photos
CREATE POLICY "Users can upload their own plant photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'plant-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own plant photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'plant-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own plant photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'plant-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
