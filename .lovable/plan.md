

## Create Submission Notification Emails

### Problem
The Submit page calls `supabase.functions.invoke('notify-submission')` but no such edge function exists. It silently fails (caught by try/catch), so no notification emails go out.

### Solution
Create a `notify-submission` edge function that sends emails to `will@actorwillroberts.com` and `sal@howtoselftape.com` when a creator submits content.

This is a **transactional email** (not an auth email), so we need to set up the transactional email infrastructure.

### Steps

1. **Set up email domain** — Required before any emails can be sent. This involves configuring a sender domain through the email setup dialog so the system can send from a real address.

2. **Create the `notify-submission` edge function** at `supabase/functions/notify-submission/index.ts`:
   - Receives `{ title, contentType, synopsis }` in the request body
   - Sends an email to both `will@actorwillroberts.com` and `sal@howtoselftape.com`
   - Email contains the submission details (title, type, synopsis) so admins can review
   - Uses the Lovable transactional email system

3. **Add config** in `supabase/config.toml` for `[functions.notify-submission]` with `verify_jwt = false`

4. **Deploy** the edge function

### Prerequisites
Before the edge function can actually send emails, we need a custom email domain configured. Without it, the function will deploy but emails won't deliver.

### Question
Do you have a domain you'd like to send these notification emails from (e.g., `notify@opprime.tv` or `noreply@opprime.tv`)? We need to set that up first so the emails actually get delivered.

