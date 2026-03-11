

## Fix Signup, Sign-in, and Add Forgot Password

### Problem 1: Duplicate slug on signup
The `handle_new_user()` trigger generates a slug from the email prefix (e.g., `will@actorwillroberts.com` → `will`), but slug `"will"` already exists from user `will@willrogersusa.com`. The trigger crashes, blocking signup entirely.

**Fix:** Update the trigger to append a random suffix if the generated slug already exists:
```sql
-- Generate base slug, check if exists, append random chars if needed
base_slug := lower(replace(split_part(NEW.email, '@', 1), '.', '-'));
IF EXISTS (SELECT 1 FROM profiles WHERE slug = base_slug) THEN
  base_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);
END IF;
```

### Problem 2: No forgot password flow
**Add to Login page:**
- "Forgot password?" link below the password field (only shown on sign-in mode)
- Clicking it shows an email input + sends reset email via `supabase.auth.resetPasswordForEmail()`

**Create `/reset-password` page:**
- Checks for `type=recovery` in URL hash
- Shows form to enter new password
- Calls `supabase.auth.updateUser({ password })`
- Add route in `App.tsx`

### Files to change

| File | Change |
|---|---|
| Migration SQL | Update `handle_new_user()` to handle duplicate slugs |
| `src/pages/Login.tsx` | Add forgot password link + email-only form state |
| `src/pages/ResetPassword.tsx` | New page for setting new password |
| `src/App.tsx` | Add `/reset-password` route |

### After fix
You'll be able to sign up with `will@actorwillroberts.com`, get auto-confirmed, and the admin role trigger will fire. Then navigate to `/admin`.

