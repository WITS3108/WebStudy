import { supabase } from "@/intergrations/supabase/client";

// ---------------------------------------------------------------------------
// Client-side auth helpers backed by Supabase Auth (the "backend").
// The Supabase browser client persists the session automatically.
// ---------------------------------------------------------------------------

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  school: string;
  className: string;
  dob: string;
  gender: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

function mapAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Tên đăng nhập hoặc mật khẩu không đúng.";
  }
  if (m.includes("email not confirmed")) {
    return "Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn.";
  }
  if (m.includes("user already registered")) {
    return "Email này đã được đăng ký.";
  }
  if (m.includes("password should be at least")) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }
  if (m.includes("invalid email")) {
    return "Email không hợp lệ.";
  }
  if (m.includes("rate limit")) {
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  }

  return message;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const identifier = input.identifier.trim();
  const password = input.password;

  if (!identifier || !password) {
    throw new Error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
  }

  // Accept either an email or a username.
  let email = identifier;
  if (!identifier.includes("@")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .maybeSingle();

    if (error) {
      console.error("[login] username lookup failed:", error);
      throw new Error("Không thể tra cứu tài khoản. Vui lòng thử lại sau.");
    }
    if (!profile?.email) {
      throw new Error("Tên người dùng không tồn tại.");
    }
    email = profile.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(mapAuthError(error.message));
  }
  if (!data.session || !data.user) {
    throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
  }

  return { id: data.user.id, email: data.user.email ?? email };
}

export type RegisterResult = {
  needsEmailConfirmation: boolean;
  user: AuthUser;
};

export async function register(input: RegisterInput): Promise<RegisterResult> {
  if (!input.username.trim() || !input.email.trim()) {
    throw new Error("Vui lòng nhập đầy đủ thông tin.");
  }
  if (input.password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  // Username uniqueness lives on the profiles table (username column).
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", input.username.trim())
    .maybeSingle();

  if (existing) {
    throw new Error("Tên người dùng đã được sử dụng.");
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        username: input.username.trim(),
        school: input.school,
        class_name: input.className,
        birth_date: input.dob || null,
        gender: input.gender,
      },
    },
  });

  if (signUpError) {
    throw new Error(mapAuthError(signUpError.message));
  }
  if (!data.user) {
    throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
  }

  // Upsert so it also works when a signup trigger already created the row.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      email: input.email.trim(),
      username: input.username.trim(),
      school: input.school || null,
      class_name: input.className || null,
      birth_date: input.dob || null,
      gender: input.gender || null,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[register] profile upsert failed:", profileError);
  }

  return {
    needsEmailConfirmation: !data.session,
    user: { id: data.user.id, email: data.user.email ?? input.email.trim() },
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export type ProfileUpdate = {
  username: string;
  email: string;
  school: string;
  className: string;
  birthDate: string;
  gender: string;
  goal: string;
  avatarPath?: string;
};

function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 256;
        let { width, height } = img;
        if (width >= height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > width && height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Không thể đọc ảnh."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Không thể đọc ảnh."));
    reader.readAsDataURL(file);
  });
}

/**
 * Turn the selected avatar file into a compact base64 data URL (resized to
 * 256px) so it can be saved directly in the profile without a storage bucket.
 */
export async function uploadAvatar(file: File): Promise<string> {
  return fileToCompressedDataUrl(file);
}

/**
 * Persist the current user's editable profile fields (username, email, school,
 * class, birth date, gender, goal, avatar) to auth metadata + `profiles`.
 */
export async function updateProfile(input: ProfileUpdate): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Bạn chưa đăng nhập.");
  }

  const username = input.username.trim();
  if (!username) {
    throw new Error("Tên người dùng không được để trống.");
  }

  // Username must be unique (excluding the current user).
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    throw new Error("Tên người dùng đã được sử dụng.");
  }

  const profileData = {
    username,
    school: input.school || null,
    class_name: input.className || null,
    birth_date: input.birthDate || null,
    gender: input.gender || null,
    goal: input.goal || null,
    ...(input.avatarPath ? { avatar_path: input.avatarPath } : {}),
  };

  const metadataData = {
    username,
    school: input.school,
    class_name: input.className,
    birth_date: input.birthDate,
    gender: input.gender,
    goal: input.goal,
    ...(input.avatarPath ? { avatar_path: input.avatarPath } : {}),
  };

  // 1) Persist to auth user metadata — always works (no RLS involved).
  const { error: metadataError } = await supabase.auth.updateUser({
    data: metadataData,
  });

  if (metadataError) {
    console.error("[updateProfile] metadata update failed:", metadataError);
    throw new Error("Không thể lưu thông tin. Vui lòng thử lại.");
  }

  // 2) Best-effort sync to the `profiles` table (succeeds once RLS policies allow it).
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: input.email.trim(),
      ...profileData,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[updateProfile] profiles upsert failed (non-fatal):", profileError);
  }
}
