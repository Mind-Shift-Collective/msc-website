# Mind Shift Collective in Kit

Separate Kit account from Ridgeline Kids. The website talks to it through the `sheet-relay` Netlify function, using the `KIT_API_KEY` environment variable. The key is never kept in this repo.

## Who's who: tags by group

Every tag starts with its group, so the groups stay together when tags are sorted.

| Group | Tags | Set by |
|---|---|---|
| **Status** | Member, Applicant, Follower, Declined | Member: Slack import or when accepted. Applicant: join form (opted in). Follower: newsletter or event reminders. Declined: by hand. |
| **Persona** | Founder or operator, Consultant, Researcher, Clinician, Therapist, Industry or pharma, Investor, Funder or philanthropy, Policy or legal, Educator, Media, Indigenous or cultural leader, Student, Other | Join form capacities (all that apply), or "I am a…" on the newsletter and reminder forms |
| **Interest** | Newsletter, Industry updates, Event deadlines, Psychedelic events, Psychedelic + mental health events, Mental & behavioral health events, Veterans, First responders, Builder Series, Presenter Series, Advisory | The newsletter topics and the reminder form's "monthly roundup" choices |
| **Source** | Join form, Event reminder, Newsletter form, Presenter pitch, Advisory brief, Company consent, Slack import, Notion import | Where the person first came from |
| **Event** | `Event: <event name>`, created automatically | "Email me reminders" on the events page |
| **Role** | Builder Series speaker, Presenter, Partner, Co-founder | By hand |

## Custom fields

Last name, Company, Job title, City, LinkedIn, Member status, Primary persona, First source, Signup date.

## What syncs from the website

| Form | Goes to Kit? | Tags |
|---|---|---|
| Join form | Only if "Send me MSC news and event updates" is ticked | Status: Applicant, Source: Join form, Interest: Newsletter, all matching Persona tags |
| Events: Email me reminders | Yes (they asked) | Status: Follower, Source: Event reminder, Interest: Event deadlines, Event: name, chosen category interests, Persona |
| Newsletter | Yes (they asked) | Status: Follower, Source: Newsletter form, chosen Interest tags, Persona |
| Presenter pitch, advisory brief, company consent | No. These are business inquiries, not opt-ins | |

## Segments to build in Kit (by hand; the API cannot create segments)

- **Members:** has tag Status: Member
- **Followers (non-members):** has Status: Follower, does not have Status: Member
- **Calendar followers:** has any Interest: … events tag or Interest: Event deadlines
- **Clinicians and therapists:** Persona: Clinician or Persona: Therapist
- **Capital:** Persona: Investor or Persona: Funder or philanthropy
- **Builders:** Persona: Founder or operator or Persona: Consultant

## Rules

- When someone is accepted, add **Status: Member**, keep their other tags, and remove Status: Applicant.
- Slack members: import a CSV export with the tags Status: Member and Source: Slack import.
- Never add someone who didn't opt in (sponsors, pitch senders, consent signers).
