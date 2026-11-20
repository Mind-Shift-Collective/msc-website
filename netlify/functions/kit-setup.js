// One-time setup: creates the MSC tag and custom field structure in Kit. Safe to run twice
// (existing tags and fields are left alone). Delete this function after setup.
import { STATUS, PERSONAS, INTERESTS, SOURCES, ROLES, FIELDS, ensureTag, ensureFields, listTags } from '../lib/kit.js';

export const handler = async (event) => {
  if (!process.env.KIT_API_KEY) return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'KIT_API_KEY is not set in Netlify' }) };
  if (event.httpMethod !== 'POST') {
    const tags = await listTags();
    return { statusCode: 200, body: JSON.stringify({ ok: true, existingTags: tags.size, note: 'POST to create the structure' }) };
  }
  const wanted = [...STATUS, ...PERSONAS, ...INTERESTS, ...SOURCES, ...ROLES];
  const before = (await listTags()).size;
  for (const name of wanted) await ensureTag(name);
  const after = (await listTags()).size;
  const fields = await ensureFields(FIELDS);
  return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, tagsWanted: wanted.length, tagsCreated: after - before, fieldsCreated: fields }) };
};
