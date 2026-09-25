import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/intergrations/supabase/client";
import { logout as signOut } from "@/lib/auth";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  school?: string;
  className?: string;
  gender?: string;
  birthDate?: string;
  goal?: string;
  avatarPath?: string;
}

type SessionUser = {
  id: string;
  email?: string;
  username?: string;
  school?: string;
  className?: string;
  gender?: string;
  birthDate?: string;
  goal?: string;
  avatarPath?: string;
};

function toSessionUser(
  session: { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null,
): SessionUser | null {
  if (!session?.user) return null;
  const meta = session.user.user_metadata as
    | {
        username?: string;
        school?: string;
        class_name?: string;
        gender?: string;
        birth_date?: string;
        goal?: string;
        avatar_path?: string;
      }
    | undefined;

  return {
    id: session.user.id,
    email: session.user.email,
    username: meta?.username,
    school: meta?.school,
    className: meta?.class_name,
    gender: meta?.gender,
    birthDate: meta?.birth_date,
    goal: meta?.goal,
    avatarPath: meta?.avatar_path,
  };
}

/**
 * Supabase-backed auth state. Reacts to auth session changes and loads the
 * user's profile. The `profiles` table is tried first, then auth user
 * metadata is used as a fallback (so the UI works even if RLS blocks the
 * profiles read).
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const sync = useCallback(async (sessionUser: SessionUser | null) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, email, school, class_name, gender, birth_date, goal, avatar_path")
      .eq("id", sessionUser.id)
      .maybeSingle();

    setUser({
      id: sessionUser.id,
      username:
        profile?.username ??
        sessionUser.username ??
        sessionUser.email?.split("@")[0] ??
        "Người dùng",
      email: profile?.email ?? sessionUser.email ?? "",
      school: profile?.school ?? sessionUser.school ?? undefined,
      className: profile?.class_name ?? sessionUser.className ?? undefined,
      gender: profile?.gender ?? sessionUser.gender ?? undefined,
      birthDate: profile?.birth_date ?? sessionUser.birthDate ?? undefined,
      goal: profile?.goal ?? sessionUser.goal ?? undefined,
      avatarPath: profile?.avatar_path ?? sessionUser.avatarPath ?? undefined,
    });
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await sync(toSessionUser(data.session));
  }, [sync]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => sync(toSessionUser(data.session)))
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void sync(toSessionUser(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [sync]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return { user, loading, refresh, logout };
}
