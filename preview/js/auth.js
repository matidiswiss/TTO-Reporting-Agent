import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js';

const SESSION_KEY = 'tto_session';
export const APP_VERSION = '3';
export const LOGIN_PATH = '/login';
export const DASHBOARD_PATH = '/dashboard';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function requireAuth(loginPath = LOGIN_PATH) {
  const session = getSession();
  if (!session?.ok) {
    window.location.replace(loginPath);
    return null;
  }
  return session;
}

export async function login(username, password) {
  const { data, error } = await supabase.rpc('tto_login', {
    p_username: username,
    p_password: password,
  });

  if (error) {
    throw error;
  }

  if (!data?.ok) {
    const err = new Error(data?.error || 'invalid_credentials');
    err.code = data?.error || 'invalid_credentials';
    throw err;
  }

  setSession(data);
  return data;
}

export function logout(loginPath = LOGIN_PATH) {
  clearSession();
  window.location.replace(loginPath);
}
