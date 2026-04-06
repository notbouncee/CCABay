-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  matric_number TEXT DEFAULT '',
  faculty TEXT DEFAULT '',
  year_of_study INTEGER DEFAULT 1,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create CCAs table
CREATE TABLE public.ccas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  weekly_commitment TEXT DEFAULT '',
  hall_points INTEGER DEFAULT 0,
  training_days TEXT[] DEFAULT '{}',
  training_time TEXT DEFAULT '',
  tryout_dates TEXT DEFAULT '',
  audition_dates TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  about TEXT DEFAULT '',
  is_beginner_friendly BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ccas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view CCAs" ON public.ccas FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_ccas_updated_at BEFORE UPDATE ON public.ccas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create CCA reviews table
CREATE TABLE public.cca_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cca_id UUID NOT NULL REFERENCES public.ccas(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL DEFAULT '',
  reviewer_role TEXT DEFAULT '',
  year TEXT DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cca_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reviews" ON public.cca_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own reviews" ON public.cca_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.cca_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.cca_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create CCA wishlist table
CREATE TABLE public.cca_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cca_id UUID NOT NULL REFERENCES public.ccas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cca_id)
);

ALTER TABLE public.cca_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist" ON public.cca_wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON public.cca_wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON public.cca_wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user timetable table
CREATE TABLE public.user_timetable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'class' CHECK (event_type IN ('class', 'cca')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT DEFAULT '',
  cca_id UUID REFERENCES public.ccas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timetable" ON public.user_timetable FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to timetable" ON public.user_timetable FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timetable" ON public.user_timetable FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from timetable" ON public.user_timetable FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cca_id UUID NOT NULL REFERENCES public.ccas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cca_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON public.applications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();