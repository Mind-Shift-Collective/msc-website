// Target for the Netlify Forms outgoing webhook ("Post to URL on new submission").
// Netlify posts the submission JSON here; this forwards it to the Apps Script that
// writes the "MSC Member Applications" sheet, then always answers 200 so Netlify
// never counts a failure (Apps Script itself answers with a redirect, which Netlify
// treated as an error and used to disable the hook).
//
// Needs SHEET_WEBHOOK_URL in Netlify environment variables (kept out of this public repo).

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };

  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) {
    console.error('SHEET_WEBHOOK_URL is not set');
    return { statusCode: 200, body: 'skipped: no SHEET_WEBHOOK_URL' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 200, body: 'skipped: bad body' };
  }
  // Accept either the raw submission or { payload: submission }.
  const sub = body.payload || body;

  // Only real Netlify submissions for the join form get through.
  if (sub.form_name !== 'join-request' || !sub.id || !sub.data) {
    return { statusCode: 200, body: 'skipped' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
      redirect: 'follow',
    });
    console.log('Sheet response', res.status, (await res.text()).slice(0, 200));
  } catch (err) {
    console.error('Sheet request failed', err);
  }
  return { statusCode: 200, body: 'ok' };
};
