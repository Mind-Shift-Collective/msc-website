// Audience filter for the events page. Each event is tagged from its "Who goes" text
// (plus name, focus and the Veterans / First responders group), so new events from the
// sheet are tagged automatically. An event can belong to several audiences.
export const AUDIENCES = [
  ['Clinicians & Facilitators', /clinician|therapist|psycholog|counsel|social worker|practitioner|facilitator|provider|nurse|mental health professional|behavioral health professional|\bkap\b|wellness professional|healthcare professional|sud-care/],
  ['Prescribers & Pharmacists', /physician|psychiatrist|prescrib|pharmacist|addiction medicine|doctor|\bmd\b|nurse practitioner/],
  ['Researchers & Academics', /research|scientist|scholar|academic|neuroscien|investigator|trial team|psychedelic-science/],
  ['Educators & Trainers', /educator|trainer|teacher|ce credit|learning design/],
  ['Students & Trainees', /student|trainee|resident/],
  ['Founders & Operators', /entrepreneur|founder|industry|business|innovator|executive|administrator|corporate|clinical development|r&d|medical affairs|retailer|nonprofit/],
  ['Investors & Funders', /investor|funder|philanthrop/],
  ['Policy & Regulatory', /polic(?:y|ies|ymaker)|regulat|legal|government|public official|minister|ethic|civil society/],
  ['Payers & Health Systems', /payer|insurer|health system|employer|hospital|behavioral health(?:care)? (?:executive|provider|field)|crisis provider|call center|public health|healthcare executive/],
  ['Indigenous & Traditional Practitioners', /indigenous|traditional|wisdom keeper|cultural leader|knowledge holder|plant medicine|faith leader|healer/],
  ['Harm Reduction & Peer Support', /harm reduction|peer|recovery|crisis|respite/],
  ['Advocates & Lived Experience', /advoca|lived experience|famil|caregiver|patient|activist|living with mental illness|spouse|community leader/],
  ['Veterans & First Responders', /veteran|military|first responder|law enforcement|firefight|\bems\b|dispatch|police|chaplain/],
  ['General Public & Curious', /general public|open to anyone|community member|psychedelic community|culture|artist|participant|curious|microdosing community|music/],
];

export const audiencesFor = (e) => {
  const text = [e.audience, e.name, e.focus, e.group].filter(Boolean).join(' ').toLowerCase();
  return AUDIENCES.filter(([, re]) => re.test(text)).map(([label]) => label);
};
