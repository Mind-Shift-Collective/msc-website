// Target for the Netlify Forms outgoing webhook ("Post to URL on new submission", any form).
// 1. join-request: forwards to the Google Apps Script that writes the "MSC Member Applications" sheet.
// 2. Opt-in forms (newsletter, event reminders, join form with "email updates" ticked): adds or updates
//    the person in the Mind Shift Collective Kit account with tags (see docs/kit-structure.md).
// Always answers 200 so Netlify never counts a failure and disables the hook.
//
// Netlify environment variables (kept out of this public repo):
//   SHEET_WEBHOOK_URL = Apps Script web app URL including ?token=...
//   KIT_API_KEY       = Mind Shift Collective Kit v4 API key

import { syncSubmission } from '../lib/kit.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 200, body: 'skipped: bad body' }; }
  const sub = body.payload || body;
  // Only real Netlify submissions get through.
  if (!sub.form_name || !sub.id || !sub.data) return { statusCode: 200, body: 'skipped' };

  if (sub.form_name === 'join-request') {
    const url = process.env.SHEET_WEBHOOK_URL;
    if (!url) console.error('SHEET_WEBHOOK_URL is not set');
    else {
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub), redirect: 'follow' });
        console.log('Sheet response', res.status, (await res.text()).slice(0, 200));
      } catch (err) { console.error('Sheet request failed', err); }
    }
  }

  try {
    const r = await syncSubmission(sub);
    console.log('Kit sync', sub.form_name, JSON.stringify(r));
  } catch (err) { console.error('Kit sync failed', err.message); }

  return { statusCode: 200, body: 'ok' };
};
