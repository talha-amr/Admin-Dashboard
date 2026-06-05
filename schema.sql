-- =========================================================================
-- PHASE 1: TABLE CREATION (The Core Data Schemas)
-- =========================================================================

-- 1. Profiles Table (Extends Supabase's internal user accounts)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Organizations Table (Houses company/school data instances)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('School', 'Nonprofit', 'Business')),
    school_district TEXT, -- Mapped conditionally to 'School' types via React
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Organization Members Table (Tracks pending and active team members)
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable until invite accepted
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active')),
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Hiring Spec Rule: "Prevent duplicate invitations to the same email within the same org"
    CONSTRAINT unique_org_email_invitation UNIQUE (organization_id, email)
);

-- =========================================================================
-- PHASE 2: SECURITY ENGINE (Row Level Security & Isolation Policies)
-- =========================================================================

-- Turn on Row Level Security for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Security Rules for Profiles
CREATE POLICY "Users can manage their own profile" ON public.profiles 
    FOR ALL USING (auth.uid() = id);

-- Security Rules for Organizations (Admins only interact with what they created)
CREATE POLICY "Admins manage their own organizations" ON public.organizations 
    FOR ALL USING (auth.uid() = created_by);

-- Security Rules for Members (Admins only see/manage members inside their own orgs)
CREATE POLICY "Admins manage members in their organizations" ON public.organization_members 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.organizations 
            WHERE public.organizations.id = public.organization_members.organization_id 
            AND public.organizations.created_by = auth.uid()
        )
    );

-- =========================================================================
-- PHASE 3: AUTOMATED PIPELINES (The Database Lifecycle Event Listener)
-- =========================================================================

-- Create a background function that mirrors new users into our public profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Admin User'),
        TRUE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the function as a real-time event listener to Supabase Auth registrations
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();