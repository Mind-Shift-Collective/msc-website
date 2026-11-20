// Mind Shift Collective -> Kit (v4 API). The API key lives only in Netlify env var KIT_API_KEY.
// Structure (see docs/kit-structure.md): tags are prefixed by group, e.g. "Status: Member",
// "Persona: Clinician", "Interest: Newsletter", "Source: Event reminder", "Event: Psychedelic Science 2027".

const API = 'https://api.kit.com/v4';

export const STATUS = ['Status: Member', 'Status: Applicant', 'Status: Follower', 'Status: Declined'];

// Join-form capacities -> persona tags.
export const PERSONA_MAP = {
  'Founder / co-founder': 'Persona: Founder or operator',
  'Consultant / solopreneur': 'Persona: Consultant',
  'Researcher': 'Persona: Researcher',
  'Medical professional / clinician': 'Persona: Clinician',
  'Licensed Therapist': 'Persona: Therapist',
  'Pharmaceutical industry': 'Persona: Industry or pharma',
  'Investor (for-profit focus)': 'Persona: Investor',
  'Philanthropic Executive / Funder (non-profit focus)': 'Persona: Funder or philanthropy',
  'Government / policy / lawyer / legal support': 'Persona: Policy or legal',
  'Professional educator or learning designer': 'Persona: Educator',
  'Journalist / media': 'Persona: Media',
  'Indigenous / cultural leader': 'Persona: Indigenous or cultural leader',
  'Student (pursuing a career in psychedelics)': 'Persona: Student',
  'Other': 'Persona: Other',
};
export const PERSONAS = [...new Set(Object.values(PERSONA_MAP))];

export const INTERESTS = [
  'Interest: Newsletter',
  'Interest: Industry updates',
  'Interest: Event deadlines',
  'Interest: Psychedelic events',
  'Interest: Psychedelic + mental health events',
  'Interest: Mental & behavioral health events',
  'Interest: Veterans',
  'Interest: First responders',
  'Interest: Builder Series',
  'Interest: Presenter Series',
  'Interest: Advisory',
];

export const SOURCES = [
  'Source: Join form',
  'Source: Event reminder',
  'Source: Newsletter form',
  'Source: Presenter pitch',
  'Source: Advisory brief',
  'Source: Company consent',
  'Source: Slack import',
  'Source: Notion import',
];

export const ROLES = ['Role: Builder Series speaker', 'Role: Presenter', 'Role: Partner', 'Role: Co-founder'];

export const FIELDS = ['Last name', 'Company', 'Job title', 'City', 'LinkedIn', 'Member status', 'Primary persona', 'First source', 'Signup date'];

// Calendar category (events page) -> interest tag.
export const CATEGORY_INTEREST = {
  'Psychedelic': 'Interest: Psychedelic events',
  'Psychedelic + mental health': 'Interest: Psychedelic + mental health events',
  'Mental & behavioral health': 'Interest: Mental & behavioral health events',
};

const key = () => process.env.KIT_API_KEY;

async function kit(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Kit-Api-Key': key(), ...(opts.headers || {}) },
  });
  const text = await res.text();
  let body = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`Kit ${opts.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status; err.body = body; throw err;
  }
  return body;
}

let tagCache = null;
export async function listTags() {
  if (tagCache) return tagCache;
  const tags = new Map();
  let after = '';
  for (let i = 0; i < 20; i++) {
    const b = await kit(`/tags?per_page=1000${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    for (const t of b.tags || []) tags.set(t.name.toLowerCase(), t);
    if (!b.pagination?.has_next_page) break;
    after = b.pagination.end_cursor;
  }
  tagCache = tags;
  return tags;
}

export async function ensureTag(name) {
  const tags = await listTags();
  const hit = tags.get(name.toLowerCase());
  if (hit) return hit;
  const b = await kit('/tags', { method: 'POST', body: JSON.stringify({ name }) });
  const t = b.tag || b;
  tags.set(name.toLowerCase(), t);
  return t;
}

let fieldCache = null;
export async function listFields(fresh = false) {
  if (fieldCache && !fresh) return fieldCache;
  const b = await kit('/custom_fields?per_page=1000');
  fieldCache = b.custom_fields || [];
  return fieldCache;
}

export async function ensureFields(labels = FIELDS) {
  const have = new Set((await listFields(true)).map((f) => f.label.toLowerCase()));
  const created = [];
  for (const label of labels) {
    if (have.has(label.toLowerCase())) continue;
    await kit('/custom_fields', { method: 'POST', body: JSON.stringify({ label }) });
    created.push(label);
  }
  return created;
}

/** Create or update a subscriber, then apply tags. Fields are keyed by custom field label. */
export async function upsert({ email, firstName = '', fields = {}, tags = [] }) {
  if (!key()) { console.log('KIT_API_KEY not set; skipping Kit sync'); return { skipped: true }; }
  if (!email || !/@/.test(email)) return { skipped: 'no email' };
  // Kit keys custom fields by their generated key (e.g. "Last name" -> "last_name"); map labels to keys.
  const byLabel = new Map((await listFields()).map((f) => [f.label.toLowerCase(), f.key]));
  const clean = {};
  for (const [label, v] of Object.entries(fields)) {
    if (v === undefined || v === null || String(v).trim() === '') continue;
    const k = byLabel.get(label.toLowerCase());
    if (k) clean[k] = String(v).trim().slice(0, 250);
  }
  await kit('/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email_address: email.trim(), first_name: firstName.trim() || undefined, state: 'active', fields: clean }),
  });
  const applied = [];
  for (const name of [...new Set(tags.filter(Boolean))]) {
    const t = await ensureTag(name);
    await kit(`/tags/${t.id}/subscribers`, { method: 'POST', body: JSON.stringify({ email_address: email.trim() }) });
    applied.push(name);
  }
  return { ok: true, tags: applied };
}

const arr = (v) => (Array.isArray(v) ? v : v ? String(v).split(/,\s*/) : []);
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

/** Map a Netlify form submission to a Kit subscriber. Returns null when the form shouldn't sync. */
export function fromSubmission(sub) {
  const d = sub.data || {};
  const form = sub.form_name;
  if (form === 'join-request') {
    // Applicants are only added to Kit when they opt in to updates on the join form.
    if (!/yes/i.test(String(d['Email updates'] || ''))) return null;
    const personas = arr(d['Capacities[]'] || d.Capacities).map((c) => PERSONA_MAP[c]).filter(Boolean);
    return {
      email: d.Email, firstName: d['First Name'],
      fields: {
        'Last name': d['Last Name'], 'Company': d['Company / Organization'], 'Job title': d['Job Title'],
        'City': d['Closest major city'], 'LinkedIn': d['LinkedIn Profile'], 'Member status': 'Applicant',
        'Primary persona': (personas[0] || '').replace('Persona: ', ''), 'First source': 'Join form', 'Signup date': today(),
      },
      tags: ['Status: Applicant', 'Source: Join form', 'Interest: Newsletter', ...personas],
    };
  }
  if (form === 'deadline-reminder') {
    const cats = arr(d['categories[]'] || d.categories).map((c) => CATEGORY_INTEREST[c]).filter(Boolean);
    const persona = d.persona ? `Persona: ${d.persona}` : '';
    return {
      email: d.email, firstName: d.first_name,
      fields: { 'Primary persona': d.persona, 'First source': 'Event reminder', 'Signup date': today() },
      tags: ['Status: Follower', 'Source: Event reminder', 'Interest: Event deadlines', d.event_name ? `Event: ${d.event_name}` : '', ...cats, persona],
    };
  }
  if (form === 'newsletter') {
    const topics = arr(d['topics[]'] || d.topics).map((t) => `Interest: ${t}`);
    const persona = d.persona ? `Persona: ${d.persona}` : '';
    return {
      email: d.email, firstName: d.first_name,
      fields: { 'Primary persona': d.persona, 'First source': 'Newsletter form', 'Signup date': today() },
      tags: ['Status: Follower', 'Source: Newsletter form', ...topics, persona],
    };
  }
  return null; // Pitches, advisory briefs and company consent are business inquiries, not opt-ins: not synced.
}

export async function syncSubmission(sub) {
  const s = fromSubmission(sub);
  if (!s) return { skipped: sub.form_name };
  return upsert(s);
}
