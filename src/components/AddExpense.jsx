import React, { useState, useEffect } from 'react'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, uid } from '../utils/helpers.js'

const TODAY = new Date().toISOString().split('T')[0]

const defaultForm = {
  type: 'expense',
  amount: '',
  category: 'food',
  description: '',
  date: TODAY,
  note: '',
  recurring: false,
  recurringPeriod: 'monthly',
}

export default function AddExpense({ editExpense, setView }) {
  const { dispatch } = useExpenses()
  const [form, setForm] = useState(editExpense || defaultForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (editExpense) setForm(editExpense)
  }, [editExpense])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  // If switching type and current category doesn't exist in new type, pick first
  const handleTypeChange = (t) => {
    const cats = t === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    const valid = cats.find(c => c.key === form.category)
    set('type', t)
    if (!valid) set('category', cats[0].key)
  }

  const handleSubmit = () => {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!form.description.trim()) {
      setError('Please add a description')
      return
    }

    const entry = {
      ...form,
      id: editExpense?.id || uid(),
      amount: parseFloat(form.amount),
    }

    if (editExpense) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: entry })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: entry })
    }

    setSuccess(true)
    setError('')
    setTimeout(() => {
      setSuccess(false)
      if (!editExpense) {
        setForm({ ...defaultForm, type: form.type })
      } else {
        setView('transactions')
      }
    }, 1200)
  }

  return (
    <div style={{ padding: '28px 28px 100px', maxWidth: 580 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="display" style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          {editExpense ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
          {editExpense ? 'Update the details below' : 'Track a new income or expense'}
        </p>
      </div>

      {/* Success toast */}
      {success && (
        <div className="animate-scale-in" style={{
          marginBottom: 20,
          padding: '14px 18px',
          borderRadius: 12,
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#10B981',
          fontSize: 14,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          ✓ {editExpense ? 'Transaction updated!' : 'Transaction added!'}
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: 20,
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(244,63,94,0.1)',
          border: '1px solid rgba(244,63,94,0.25)',
          color: '#F43F5E',
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div className="glass rounded-2xl p-6 stagger">

        {/* Type toggle */}
        <div>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            TRANSACTION TYPE
          </label>
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            {['expense', 'income'].map(t => (
              <button key={t}
                onClick={() => handleTypeChange(t)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.2s',
                  background: form.type === t
                    ? (t === 'expense' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)')
                    : 'transparent',
                  color: form.type === t
                    ? (t === 'expense' ? '#F43F5E' : '#10B981')
                    : '#64748B',
                  boxShadow: form.type === t
                    ? `0 0 16px ${t === 'expense' ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`
                    : 'none',
                }}>
                {t === 'expense' ? '↑ Expense' : '↓ Income'}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            AMOUNT
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              fontFamily: 'JetBrains Mono', fontSize: 18, color: '#64748B',
            }}>$</span>
            <input
              type="number"
              className="field"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              style={{ paddingLeft: 32, fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 600, height: 56 }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            DESCRIPTION
          </label>
          <input
            type="text"
            className="field"
            placeholder="What was this for?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            maxLength={80}
          />
        </div>

        {/* Category grid */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
            CATEGORY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => set('category', cat.key)}
                title={cat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  borderRadius: 12,
                  border: form.category === cat.key ? `1px solid ${cat.color}` : '1px solid rgba(255,255,255,0.06)',
                  background: form.category === cat.key ? cat.bg : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                <span style={{ fontSize: 10, color: form.category === cat.key ? cat.color : '#64748B', fontFamily: 'DM Sans', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            DATE
          </label>
          <input
            type="date"
            className="field"
            value={form.date}
            max={TODAY}
            onChange={e => set('date', e.target.value)}
          />
        </div>

        {/* Note */}
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
            NOTE <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            className="field"
            placeholder="Any extra details..."
            value={form.note}
            onChange={e => set('note', e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
        </div>

        {/* Recurring toggle */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Recurring transaction</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Repeats on a schedule</div>
          </div>
          <label className="toggle-wrap">
            <input type="checkbox" checked={form.recurring} onChange={e => set('recurring', e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        {form.recurring && (
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              PERIOD
            </label>
            <select className="field" value={form.recurringPeriod} onChange={e => set('recurringPeriod', e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={handleSubmit} style={{ flex: 1 }}>
            {editExpense ? 'Save Changes' : (form.type === 'expense' ? 'Add Expense' : 'Add Income')}
          </button>
          {editExpense && (
            <button className="btn-ghost" onClick={() => setView('transactions')}>
              Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  )
}