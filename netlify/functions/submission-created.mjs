// Runs automatically on every verified Netlify Forms submission.
// Forwards join-request submissions to the Google Apps Script that writes the
// "MSC Member Applications" sheet. Replaces the outgoing webhook, which Netlify
// disabled because Apps Script answers with a redirect (counted as a failure).
//
// Needs one environment variable in Netlify (kept out of this public repo):
//   SHEET_WEBHOOK_URL = the Apps Script web app URL, including ?token=...

export const handler = async (event) => {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) {
    console.error('SHEET_WEBHOOK_URL is not set; submission not sent to sheet.');
    return { statusCode: 200, body: 'skipped: no SHEET_WEBHOOK_URL' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}').payload || {};
  } catch (err) {
    console.error('Could not parse submission body', err);
    return { statusCode: 200, body: 'skipped: bad body' };
  }

  if (payload.form_name !== 'join-request') {
    return { statusCode: 200, body: 'skipped: ' + payload.form_name };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    const text = await res.text();
    console.log('Sheet response', res.status, text.slice(0, 200));
  } catch (err) {
    console.error('Sheet request failed', err);
  }

  // Always 200 so Netlify never retries (the script de-duplicates anyway).
  return { statusCode: 200, body: 'ok' };
};
