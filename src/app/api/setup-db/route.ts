import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Create profiles table
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS addresses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          label TEXT NOT NULL DEFAULT 'Casa',
          street TEXT NOT NULL DEFAULT '',
          exterior TEXT NOT NULL DEFAULT '',
          interior TEXT NOT NULL DEFAULT '',
          colonia TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          state TEXT NOT NULL DEFAULT '',
          zip TEXT NOT NULL DEFAULT '',
          is_default BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          items JSONB NOT NULL DEFAULT '[]',
          tecnica JSONB,
          subtotal NUMERIC NOT NULL DEFAULT 0,
          total NUMERIC NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          mp_preference_id TEXT,
          mp_payment_id TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

        DO $$ BEGIN
          CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        DO $$ BEGIN
          CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        DO $$ BEGIN
          CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
        DO $$ BEGIN
          CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DB setup error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
