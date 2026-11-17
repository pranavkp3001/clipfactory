# Integration setup

The dashboard can be deployed without credentials, but processing requires server-side configuration.

## OpenShorts

1. Create an API key in your OpenShorts account (starts with `osk_`).
2. In Vercel → Project → Settings → Environment Variables, add:
   - `OPENSHORTS_API_KEY` = your key
   - `OPENSHORTS_WEBHOOK_SECRET` = a long random secret (same secret used for webhook signing)
   - `OPENSHORTS_API_URL` = `https://api.openshorts.app` (optional; this is the default)
3. Redeploy after saving environment variables.

The API key is used only in server routes and is never sent to the browser. The process endpoint requires the user to confirm rights to the source video. OpenShorts API usage consumes the account's plan minutes; its hosted free tier is limited and watermarked.

## Webhook

Configure the same webhook secret in Vercel. The callback endpoint is `/api/webhooks/openshorts`. The handler verifies the raw-body HMAC signature before acknowledging the event. Database persistence is the next integration step.

## Supabase persistence

1. Create a Supabase project.
2. Run `supabase/schema.sql` in its SQL Editor.
3. Add server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
4. Never expose the service role key in a `NEXT_PUBLIC_*` variable.

The current campaign form is still browser-session state. Persistent campaign/job/clip/post storage and account authentication must be enabled before treating this as a production multi-user service.

## Publishing

OpenShorts publishing requires a connected Upload-Post profile in the OpenShorts account. TikTok submissions arrive as drafts; Instagram and YouTube publishing behavior depends on the connected account and provider. Campaign reward-platform submissions are separate and must be completed manually unless that platform exposes a supported official API.
