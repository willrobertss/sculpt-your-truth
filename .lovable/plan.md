

## Remove Approval Gate from Submission Flow

### What changes
The submission flow currently inserts content with `status: 'pending'` and tells users to wait 5-10 days for review. Since we're in test mode, we'll make submissions go live immediately.

### Steps

1. **Update `src/pages/Submit.tsx`**:
   - Change `status: 'pending'` to `status: 'live'` for all three content types (films, shorts, verticals)
   - Change the submission record status from `'pending'` to `'live'` as well
   - Update success message from "submitted for review" to "Your content is now live!"
   - Update the confirmation screen text — remove the "5-10 business days review" language, replace with "Your content is live on the platform"
   - Change the submit button text from "Submit for Review" to "Publish"
   - Remove the `notify-submission` edge function call (no approval needed)

2. **No database changes needed** — the `submission_status` enum already includes `'live'`

### Result
Creators sign up, fill in details, agree to rights, and their content goes live immediately. The approval gateway can be re-added later.

