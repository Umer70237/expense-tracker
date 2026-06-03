// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES = {
  // Expense
  housing: {
    label: 'Internet',
    emoji: '🏠',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.15)',
    type: 'expense',
  },

  transport: {
    label: 'Hygiene',
    emoji: '🚗',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.15)',
    type: 'expense',
  },

  food: {
    label: 'Food',
    emoji: '🍔',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    type: 'expense',
  },

  health: {
    label: 'Health',
    emoji: '💊',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.15)',
    type: 'expense',
  },

  entertainment: {
    label: 'Extra',
    emoji: '🎮',
    color: '#F43F5E',
    bg: 'rgba(244,63,94,0.15)',
    type: 'expense',
  },

  shopping: {
    label: 'Shopping',
    emoji: '🛍️',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.15)',
    type: 'expense',
  },

  education: {
    label: 'Charity',
    emoji: '📚',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    type: 'expense',
  },

  travel: {
    label: 'Travel',
    emoji: '✈️',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.15)',
    type: 'expense',
  },

  utilities: {
    label: 'Utilities',
    emoji: '💡',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.15)',
    type: 'expense',
  },

  other: {
    label: 'Other',
    emoji: '📦',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.15)',
    type: 'expense',
  },

  // Income
  salary: {
    label: 'Salary',
    emoji: '💼',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.15)',
    type: 'income',
  },

  freelance: {
    label: 'Freelance',
    emoji: '💻',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.15)',
    type: 'income',
  },

  investment: {
    label: 'Investment',
    emoji: '📈',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.15)',
    type: 'income',
  },

  gift: {
    label: 'Gift',
    emoji: '🎁',
    color: '#F43F5E',
    bg: 'rgba(244,63,94,0.15)',
    type: 'income',
  },

  other_income: {
    label: 'Other Income',
    emoji: '💰',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.15)',
    type: 'income',
  },
}

// ─── Filtered categories ─────────────────────────────────────────────────────
export const EXPENSE_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'expense')
  .map(([k, v]) => ({ key: k, ...v }))

export const INCOME_CATEGORIES = Object.entries(CATEGORIES)
  .filter(([, v]) => v.type === 'income')
  .map(([k, v]) => ({ key: k, ...v }))

// ─── Formatters ──────────────────────────────────────────────────────────────
export const fmt = (amount, compact = false) => {
  if (compact && amount >= 1000) {
    return '$' + (amount / 1000).toFixed(1) + 'k'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ─── Date formatter (SAFE) ───────────────────────────────────────────────────
export const fmtDate = (iso) => {
  if (!iso) return 'No date'

  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return 'Invalid date'

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const fmtMonth = (iso) => {
  if (!iso) return ''

  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return ''

  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

// ─── UID ─────────────────────────────────────────────────────────────────────
export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36)

// ─── Date helpers ────────────────────────────────────────────────────────────
export const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// ─── Seed data ───────────────────────────────────────────────────────────────
export const SEED_EXPENSES = [
  { id: uid(), type: 'income', category: 'salary', amount: 5500, description: 'Monthly salary', date: daysAgo(2), recurring: true },

  { id: uid(), type: 'expense', category: 'housing', amount: 1450, description: 'Rent payment', date: daysAgo(3), recurring: true },

  { id: uid(), type: 'expense', category: 'food', amount: 68.5, description: 'Groceries', date: daysAgo(1), recurring: false },

  { id: uid(), type: 'expense', category: 'entertainment', amount: 14.99, description: 'Netflix', date: daysAgo(4), recurring: true },

  { id: uid(), type: 'expense', category: 'transport', amount: 45, description: 'Uber rides', date: daysAgo(5), recurring: false },

  { id: uid(), type: 'income', category: 'freelance', amount: 850, description: 'Web project', date: daysAgo(6), recurring: false },

  { id: uid(), type: 'expense', category: 'shopping', amount: 129, description: 'Shoes', date: daysAgo(7), recurring: false },

  { id: uid(), type: 'expense', category: 'utilities', amount: 92, description: 'Electric bill', date: daysAgo(8), recurring: true },

  { id: uid(), type: 'expense', category: 'food', amount: 38.2, description: 'Dinner', date: daysAgo(9), recurring: false },

  { id: uid(), type: 'expense', category: 'health', amount: 55, description: 'Gym', date: daysAgo(10), recurring: true },
]

export const SEED_BUDGETS = {
  housing: { limit: 1600 },
  transport: { limit: 200 },
  food: { limit: 400 },
  health: { limit: 200 },
  entertainment: { limit: 150 },
  shopping: { limit: 300 },
  education: { limit: 250 },
  travel: { limit: 500 },
  utilities: { limit: 150 },
  other: { limit: 100 },
}