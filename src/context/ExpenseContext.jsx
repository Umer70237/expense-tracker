import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo
} from 'react'

import {
  SEED_EXPENSES,
  SEED_BUDGETS,
  CATEGORIES
} from '../utils/helpers.js'

const ExpenseContext = createContext(null)

// ─── localStorage helpers ─────────────────────────────────────────────
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

// ─── Reducer ──────────────────────────────────────────────────────────
const initialState = {
  expenses: load('ledger_expenses', SEED_EXPENSES),
  budgets: load('ledger_budgets', SEED_BUDGETS),
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
      }

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(e => e.id !== action.id),
      }

    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.category]: { limit: action.limit },
        },
      }

    case 'CLEAR_ALL':
      return {
        ...state,
        expenses: [],
      }

    default:
      return state
  }
}

// ─── Provider ─────────────────────────────────────────────────────────
export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // persist
  useEffect(() => {
    save('ledger_expenses', state.expenses)
  }, [state.expenses])

  useEffect(() => {
    save('ledger_budgets', state.budgets)
  }, [state.budgets])

  // ─── computed values ───────────────────────────────────────────────
  const computed = useMemo(() => {
    const expenses = state.expenses || []
    const budgets = state.budgets || {}

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((s, e) => s + e.amount, 0)

    const totalExpenses = expenses
      .filter(e => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0)

    const balance = totalIncome - totalExpenses

    const savingsRate =
      totalIncome > 0
        ? ((totalIncome - totalExpenses) / totalIncome) * 100
        : 0

    // by category
    const byCategory = {}
    expenses
      .filter(e => e.type === 'expense')
      .forEach(e => {
        byCategory[e.category] =
          (byCategory[e.category] || 0) + e.amount
      })

    // monthly grouping
    const monthMap = {}

    expenses.forEach(e => {
      const key = e.date?.slice(0, 7)
      if (!key) return

      if (!monthMap[key]) {
        monthMap[key] = { income: 0, expenses: 0 }
      }

      if (e.type === 'income') monthMap[key].income += e.amount
      if (e.type === 'expense') monthMap[key].expenses += e.amount
    })

    const monthlyData = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [yr, mo] = key.split('-')
        const label = new Date(+yr, +mo - 1).toLocaleDateString(
          'en-US',
          { month: 'short' }
        )

        return {
          month: label,
          ...val,
          net: val.income - val.expenses,
        }
      })

    // budgets
    const budgetUsage = Object.entries(budgets).map(
      ([cat, { limit }]) => {
        const spent = byCategory[cat] || 0
        const pct = limit > 0 ? (spent / limit) * 100 : 0
        const over = spent > limit

        return {
          cat,
          limit,
          spent,
          pct,
          over,
          ...CATEGORIES[cat],
        }
      }
    )

    // pie data
    const pieData = Object.entries(byCategory)
      .filter(([, v]) => v > 0)
      .map(([cat, value]) => ({
        name: CATEGORIES[cat]?.label || cat,
        value,
        color: CATEGORIES[cat]?.color || '#888',
      }))
      .sort((a, b) => b.value - a.value)

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      byCategory,
      monthlyData,
      budgetUsage,
      pieData,
    }
  }, [state])

  const value = {
    expenses: state.expenses,
    budgets: state.budgets,
    dispatch,
    ...computed,
  }

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  )
}

// ─── Safe hook (NO CRASH VERSION) ────────────────────────────────────
export const useExpenses = () => {
  const ctx = useContext(ExpenseContext)

  if (!ctx) {
    console.error('ExpenseContext missing')

    return {
      expenses: [],
      budgets: {},
      dispatch: () => {},
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      savingsRate: 0,
      byCategory: {},
      monthlyData: [],
      budgetUsage: [],
      pieData: [],
    }
  }

  return ctx
}