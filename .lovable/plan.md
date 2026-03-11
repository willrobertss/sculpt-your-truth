

## Make will@actorwillroberts.com the Admin

### Steps

1. **Enable auto-confirm for email signups** so you can sign up and immediately log in without email verification
2. **Create a database trigger or migration** to automatically assign the `admin` role to `will@actorwillroberts.com` when that account is created
3. No code changes needed — the existing Login page at `/login` already has signup functionality, and the `useAdminCheck` hook + Admin page already check `user_roles`

### Technical Details

- Use `configure_auth` to enable auto-confirm on signups
- Run a migration that creates a trigger: when a new user signs up with email `will@actorwillroberts.com`, automatically insert an `admin` role into `user_roles`
- After signup, navigating to `/admin` will work immediately

### Flow
1. Go to `/login` → Sign Up with `will@actorwillroberts.com` + your password
2. You're logged in immediately (auto-confirm)
3. The trigger auto-assigns admin role
4. Navigate to `/admin` — full access

