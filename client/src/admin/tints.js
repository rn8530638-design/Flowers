// The 4 pastel tints a feature card can use. `value` is what the DB stores;
// `swatch` is the representative colour shown in the admin picker/list (matches
// the stroke/numeral colour used by the public Features cards).
export const TINTS = [
  { value: 'pink', label: 'Розовый', swatch: '#E79BAE' },
  { value: 'peach', label: 'Персиковый', swatch: '#E0A94F' },
  { value: 'lavender', label: 'Лавандовый', swatch: '#A88AC9' },
  { value: 'blue', label: 'Голубой', swatch: '#6FA2C4' },
]

export const tintOf = (value) => TINTS.find((t) => t.value === value) || TINTS[0]
