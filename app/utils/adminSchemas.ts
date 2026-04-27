// Field schemas that drive the admin CRUD UI. One source of truth for what
// each content collection looks like — both the form fields and the card
// preview. Keep field keys aligned with the seed data shapes in
// server/data/seed.ts so new docs match what the landing page expects.

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'url' | 'select' | 'tags' | 'json'

export type FieldDef = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]      // select only
  min?: number            // number only
  max?: number            // number only
  hint?: string
}

export type CollectionSchema = {
  slug: string                   // matches /api/v1/<slug>
  label: string                  // shown in tabs
  blurb: string                  // small description in the manager header
  fields: FieldDef[]
  // Card preview — runs against the raw item.
  cardTitle: (item: any) => string
  cardSubtitle?: (item: any) => string
  cardIcon?: (item: any) => string | null   // URL or null
}

export const SCHEMAS: Record<string, CollectionSchema> = {
  stats: {
    slug: 'stats',
    label: 'Stats',
    blurb: 'Hero HUD numbers (PROJECTS, COFFEE…).',
    fields: [
      { key: 'label', label: 'Label', type: 'text', required: true, placeholder: 'PROJECTS' },
      { key: 'value', label: 'Value', type: 'text', required: true, placeholder: '50+' },
      { key: 'icon', label: 'Icon URL', type: 'url', placeholder: '/icons/ui/calendar.svg' },
    ],
    cardTitle: (i) => i.label || '(no label)',
    cardSubtitle: (i) => i.value || '',
    cardIcon: (i) => i.icon || null,
  },

  companies: {
    slug: 'companies',
    label: 'Companies',
    blurb: 'Work history cards.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'period', label: 'Period', type: 'text', placeholder: 'Feb 2024 - Actualidad' },
      { key: 'logo', label: 'Logo URL', type: 'url' },
      { key: 'tech', label: 'Tech', type: 'tags', hint: 'Comma-separated' },
    ],
    cardTitle: (i) => i.name || '(no name)',
    cardSubtitle: (i) => [i.role, i.period].filter(Boolean).join(' · '),
    cardIcon: (i) => i.logo || null,
  },

  skills: {
    slug: 'skills',
    label: 'Skills',
    blurb: 'Skill cards with XP bars.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'icon', label: 'Icon URL', type: 'url' },
      { key: 'level', label: 'Level (0-100)', type: 'number', min: 0, max: 100 },
    ],
    cardTitle: (i) => i.name || '(no name)',
    cardSubtitle: (i) => `XP ${i.level ?? 0}/100`,
    cardIcon: (i) => i.icon || null,
  },

  projects: {
    slug: 'projects',
    label: 'Projects',
    blurb: 'Quest log entries.',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['MAIN_QUEST', 'SIDE_QUEST'] },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tech', label: 'Tech', type: 'tags' },
      { key: 'xp', label: 'XP', type: 'number', min: 0 },
      { key: 'completed', label: 'Completed', type: 'boolean' },
      { key: 'redirect', label: 'Redirect URL', type: 'url' },
      { key: 'platforms', label: 'Platforms', type: 'json', hint: 'Array of {name, icon, url} or []' },
    ],
    cardTitle: (i) => i.name || '(no name)',
    cardSubtitle: (i) => [i.type, i.completed ? 'completed' : 'active'].filter(Boolean).join(' · '),
    cardIcon: () => null,
  },

  social: {
    slug: 'social',
    label: 'Social',
    blurb: 'Connect-section links (GitHub, LinkedIn, …).',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'icon', label: 'Icon URL', type: 'url' },
      { key: 'handle', label: 'Handle', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
    cardTitle: (i) => i.name || '(no name)',
    cardSubtitle: (i) => i.handle || i.url || '',
    cardIcon: (i) => i.icon || null,
  },

  credentials: {
    slug: 'credentials',
    label: 'Credentials',
    blurb: 'Degrees and certifications.',
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['DEGREE', 'CERTIFICATE'], required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'institution', label: 'Institution', type: 'text' },
      { key: 'period', label: 'Period', type: 'text', placeholder: 'NOV 2024' },
      { key: 'field', label: 'Field (degree only)', type: 'text' },
      { key: 'skills', label: 'Skills', type: 'tags' },
      { key: 'credentialId', label: 'Credential ID', type: 'text' },
      { key: 'image', label: 'Image URL', type: 'url' },
    ],
    cardTitle: (i) => i.title || '(no title)',
    cardSubtitle: (i) => [i.institution, i.period].filter(Boolean).join(' · '),
    cardIcon: (i) => i.image || null,
  },
}

export const COLLECTION_SLUGS = Object.keys(SCHEMAS)

// Build an empty record matching the schema. Used as the initial state of the
// "create" form. Only sets per-type sensible defaults — `null` for url-ish
// fields keeps the placeholder visible.
export function blankItem(schema: CollectionSchema): Record<string, unknown> {
  const out: Record<string, unknown> = { isActive: true, order: null }
  for (const f of schema.fields) {
    switch (f.type) {
      case 'tags': out[f.key] = []; break
      case 'boolean': out[f.key] = false; break
      case 'number': out[f.key] = null; break
      case 'json': out[f.key] = []; break
      default: out[f.key] = ''
    }
  }
  return out
}
