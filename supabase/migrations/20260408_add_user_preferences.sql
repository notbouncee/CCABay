-- Store user preference selections for first-login onboarding and later edits.
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_categories TEXT[] NOT NULL DEFAULT '{}',
  goal_tags TEXT[] NOT NULL DEFAULT '{}',
  wants_hall_points BOOLEAN NOT NULL DEFAULT false,
  hall_points_target INTEGER NOT NULL DEFAULT 3 CHECK (hall_points_target >= 0 AND hall_points_target <= 5),
  commitment_level INTEGER NOT NULL DEFAULT 3 CHECK (commitment_level >= 1 AND commitment_level <= 5),
  sync_timetable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
ON public.user_preferences
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
