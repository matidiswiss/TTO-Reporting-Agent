-- TTO Reporting Agent auth (NAISU_COMM / atnrdggjbfaosjqafkor)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.tto_app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  password_hash text NOT NULL,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tto_app_users_username_lower CHECK (username = lower(username)),
  CONSTRAINT tto_app_users_username_unique UNIQUE (username)
);

CREATE OR REPLACE FUNCTION public.tto_login(p_username text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  u record;
BEGIN
  IF p_username IS NULL OR trim(p_username) = '' OR p_password IS NULL OR p_password = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'credentials_required');
  END IF;

  SELECT id, username, display_name, password_hash, is_active
  INTO u
  FROM public.tto_app_users
  WHERE username = lower(trim(p_username));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_credentials');
  END IF;

  IF NOT u.is_active THEN
    RETURN jsonb_build_object('ok', false, 'error', 'account_disabled');
  END IF;

  IF u.password_hash = extensions.crypt(p_password, u.password_hash) THEN
    RETURN jsonb_build_object(
      'ok', true,
      'user_id', u.id,
      'username', u.username,
      'display_name', coalesce(u.display_name, u.username)
    );
  END IF;

  RETURN jsonb_build_object('ok', false, 'error', 'invalid_credentials');
END;
$$;

REVOKE ALL ON FUNCTION public.tto_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tto_login(text, text) TO anon, authenticated, service_role;

ALTER TABLE public.tto_app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tto_users_no_anon_select"
  ON public.tto_app_users FOR SELECT TO anon, authenticated USING (false);

CREATE POLICY "tto_users_no_anon_write"
  ON public.tto_app_users FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
