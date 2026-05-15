-- ============================================================
-- Firmadeal Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  company     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Listings ───────────────────────────────────────────────
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'paused', 'expired');
CREATE TYPE business_status AS ENUM ('active_profitable', 'in_development', 'restructuring');
CREATE TYPE listing_plan AS ENUM ('base', 'plus', 'premium');
CREATE TYPE operation_type AS ENUM (
  'vollstaendige_uebertragung',
  'unternehmensuebertragung',
  'gewerbeimmobilie',
  'anteilsuebertragung',
  'unternehmensverpachtung',
  'immobilienvermietung'
);

CREATE TABLE IF NOT EXISTS public.listings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status            listing_status DEFAULT 'draft',

  -- Business identity
  type_of_operation operation_type NOT NULL,
  category          TEXT NOT NULL,
  city              TEXT NOT NULL,
  region            TEXT,
  country           TEXT NOT NULL DEFAULT 'DE',
  company_name      TEXT,
  vat_number        TEXT,
  founded_year      INTEGER,

  -- Listing content
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  asking_price      BIGINT,
  price_confidential BOOLEAN DEFAULT FALSE,

  -- Financials
  annual_revenue    BIGINT,
  ebitda            BIGINT,
  employees         INTEGER,

  -- Details
  business_model    TEXT,
  competition       TEXT,
  assets_included   TEXT,
  reason_for_sale   TEXT,
  status_business   business_status,

  -- Contact
  phone             TEXT,
  show_phone        BOOLEAN DEFAULT FALSE,

  -- Media
  images            TEXT[] DEFAULT '{}',

  -- Plan
  plan              listing_plan,
  plan_expires_at   TIMESTAMPTZ,
  featured          BOOLEAN DEFAULT FALSE,

  -- Analytics
  views_count       INTEGER DEFAULT 0,
  inquiries_count   INTEGER DEFAULT 0,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Public can read active listings
CREATE POLICY "Anyone can read active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

-- Owners can read all their own listings
CREATE POLICY "Owners can read own listings"
  ON public.listings FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can insert
CREATE POLICY "Owners can insert listings"
  ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can update
CREATE POLICY "Owners can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Owners can delete
CREATE POLICY "Owners can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Inquiries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inquiries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id    UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_email  TEXT NOT NULL,
  sender_name   TEXT NOT NULL,
  message       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can create an inquiry
CREATE POLICY "Anyone can create inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (TRUE);

-- Listing owners can read inquiries for their listings
CREATE POLICY "Listing owners can read inquiries"
  ON public.inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = inquiries.listing_id
        AND listings.user_id = auth.uid()
    )
  );

-- Auto-increment inquiry count on listing
CREATE OR REPLACE FUNCTION increment_inquiry_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.listings
  SET inquiries_count = inquiries_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_increment
  AFTER INSERT ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION increment_inquiry_count();

-- ── Payments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id        UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  plan              listing_plan NOT NULL,
  amount            INTEGER NOT NULL, -- in cents
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ── Supabase Storage Bucket ───────────────────────────────
-- Run this in the Supabase dashboard Storage section, or use the CLI:
-- supabase storage create listing-images --public

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX listings_status_idx ON public.listings(status);
CREATE INDEX listings_category_idx ON public.listings(category);
CREATE INDEX listings_region_idx ON public.listings(region);
CREATE INDEX listings_featured_idx ON public.listings(featured);
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX inquiries_listing_id_idx ON public.inquiries(listing_id);
