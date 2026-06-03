import React, { useState } from 'react'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { fmt, EXPENSE_CATEGORIES, CATEGORIES } from '../utils/helpers.js'

// ── Single budget row card ────────────────────────────────────────────────────
export function BudgetCard({ item, onEdit }) {
  const pct   = item.pct
  const over  = item.over
  const warn  = pct >= 80 && !over

  const barColor = over  ? '#F43F5E'
                 : warn  ? '#F59E0B'
                 :          '#10B981'

  return (
    <div
      className="glass glass-hover rounded-2xl p-5"
      style={{
        border: over
          ? '1px solid rgba(244,63,94,0.25)'
          : warn
          ? '1px solid rgba(245,158,11,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        transition: 'all 0.2s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: item.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {item.emoji}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#F1F5F9' }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
              {fmt(item.spent)} <span style={{ color: '#475569' }}>of {fmt(item.limit)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {over && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: '#F43F5E', background: 'rgba(244,63,94,0.12)',
              padding: '3px 8px', borderRadius: 999,
            }}>OVER BUDGET</span>
          )}
          {warn && !over && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: '#F59E0B', background: 'rgba(245,158,11,0.1)',
              padding: '3px 8px', borderRadius: 999,
            }}>⚠ NEAR LIMIT</span>
          )}
          <button
            onClick={() => onEdit(item)}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer', fontSize: 13, color: '#94A3B8',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
          >✎</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
        />
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontSize: 12, color: barColor, fontWeight: 500 }}>
          {pct.toFixed(0)}% used
        </span>
        <span style={{ fontSize: 12, color: over ? '#F43F5E' : '#64748B' }}>
          {over
            ? `${fmt(item.spent - item.limit)} over`
            : `${fmt(item.limit - item.spent)} left`}
        </span>
      </div>
    </div>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function EditModal({ item, onSave, onClose }) {
  const [val, setVal] = useState(String(item.limit))
  const [err, setErr] = useState('')

  const handleSave = () => {
    const n = parseFloat(val)
    if (!val || isNaN(n) || n <= 0) { setErr('Enter a valid positive amount'); return }
    onSave(item.cat, n)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass animate-scale-in"
        style={{ width: 380, borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {item.emoji}
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17 }}>Edit Budget</div>
            <div style={{ color: '#64748B', fontSize: 13 }}>{item.label}</div>
          </div>
        </div>

        <div style={{ marginBottom: 8, fontSize: 11, color: '#64748B', letterSpacing: '0.08em' }}>MONTHLY LIMIT</div>
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'JetBrains Mono', fontSize: 18, color: '#64748B' }}>$</span>
          <input
            type="number"
            className="field"
            value={val}
            onChange={e => { setVal(e.target.value); setErr('') }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
            style={{ paddingLeft: 32, fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 600, height: 52 }}
          />
        </div>

        {err && <div style={{ fontSize: 12, color: '#F43F5E', marginBottom: 10 }}>{err}</div>}

        <div style={{ fontSize: 12, color: '#475569', marginBottom: 20 }}>
          Currently spent: <span style={{ color: '#F1F5F9', fontFamily: 'JetBrains Mono' }}>{fmt(item.spent)}</span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Save Budget</button>
          <button className="btn-ghost"   onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Add new budget modal ──────────────────────────────────────────────────────
function AddBudgetModal({ existing, onSave, onClose }) {
  const available = EXPENSE_CATEGORIES.filter(c => !existing.includes(c.key))
  const [cat, setCat]   = useState(available[0]?.key || '')
  const [val, setVal]   = useState('')
  const [err, setErr]   = useState('')

  const handleSave = () => {
    const n = parseFloat(val)
    if (!cat) { setErr('Pick a category'); return }
    if (!val || isNaN(n) || n <= 0) { setErr('Enter a valid amount'); return }
    onSave(cat, n)
    onClose()
  }

  if (available.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <div className="glass animate-scale-in" style={{ width: 360, borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: 'Syne', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>All categories have budgets!</div>
          <div style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>Edit any card above to update a budget limit.</div>
          <button className="btn-ghost" onClick={onClose} style={{ width: '100%' }}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass animate-scale-in" style={{ width: 380, borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Add Budget</div>
        <div style={{ color: '#64748B', fontSize: 13, marginBottom: 24 }}>Set a monthly spending limit for a category</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', marginBottom: 8 }}>CATEGORY</div>
          <select className="field" value={cat} onChange={e => setCat(e.target.value)}>
            {available.map(c => (
              <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', marginBottom: 8 }}>MONTHLY LIMIT</div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'JetBrains Mono', fontSize: 18, color: '#64748B' }}>$</span>
            <input
              type="number"
              className="field"
              value={val}
              onChange={e => { setVal(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="0.00"
              autoFocus
              style={{ paddingLeft: 32, fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 600, height: 52 }}
            />
          </div>
        </div>

        {err && <div style={{ fontSize: 12, color: '#F43F5E', marginBottom: 10 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-primary" onClick={handleSave} style={{ flex: 1 }}>Add Budget</button>
          <button className="btn-ghost"   onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Budgets() {
  const { budgetUsage, dispatch } = useExpenses()

  const [editItem,    setEditItem]    = useState(null)
  const [showAdd,     setShowAdd]     = useState(false)

  const overBudget  = budgetUsage.filter(b => b.over)
  const nearLimit   = budgetUsage.filter(b => b.pct >= 80 && !b.over)
  const onTrack     = budgetUsage.filter(b => b.pct < 80)

  const totalBudgeted = budgetUsage.reduce((s, b) => s + b.limit, 0)
  const totalSpent    = budgetUsage.reduce((s, b) => s + b.spent, 0)
  const overallPct    = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0
  const overallColor  = overallPct >= 100 ? '#F43F5E' : overallPct >= 80 ? '#F59E0B' : '#10B981'

  const handleSave = (cat, limit) => dispatch({ type: 'SET_BUDGET', category: cat, limit })

  const existingCats = budgetUsage.map(b => b.cat)

  return (
    <div style={{ padding: '28px 28px 100px', maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Budgets
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
            Monthly spending limits across categories
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + New Budget
        </button>
      </div>

      {/* Overall health card */}
      <div className="gradient-border rounded-2xl p-6 animate-slide-up" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', marginBottom: 4 }}>OVERALL BUDGET HEALTH</div>
            <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {fmt(totalSpent)} <span style={{ color: '#64748B', fontWeight: 400, fontSize: 16 }}>of {fmt(totalBudgeted)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 28, color: overallColor, letterSpacing: '-0.03em' }}>
              {overallPct.toFixed(0)}%
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>used</div>
          </div>
        </div>

        <div className="progress-track" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${overallPct}%`, background: overallColor }} />
        </div>

        {/* Alert pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 12, color: '#10B981' }}>
            ✓ {onTrack.length} on track
          </div>
          {nearLimit.length > 0 && (
            <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 12, color: '#F59E0B' }}>
              ⚠ {nearLimit.length} near limit
            </div>
          )}
          {overBudget.length > 0 && (
            <div style={{ padding: '6px 14px', borderRadius: 999, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', fontSize: 12, color: '#F43F5E' }}>
              ✕ {overBudget.length} over budget
            </div>
          )}
        </div>
      </div>

      {/* Over budget section */}
      {overBudget.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#F43F5E', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span> OVER BUDGET ({overBudget.length})
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {overBudget.map(item => (
              <BudgetCard key={item.cat} item={item} onEdit={setEditItem} />
            ))}
          </div>
        </div>
      )}

      {/* Near limit section */}
      {nearLimit.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
            ▲ APPROACHING LIMIT ({nearLimit.length})
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {nearLimit.map(item => (
              <BudgetCard key={item.cat} item={item} onEdit={setEditItem} />
            ))}
          </div>
        </div>
      )}

      {/* On track section */}
      {onTrack.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
            ✓ ON TRACK ({onTrack.length})
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {onTrack.map(item => (
              <BudgetCard key={item.cat} item={item} onEdit={setEditItem} />
            ))}
          </div>
        </div>
      )}

      {budgetUsage.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>◫</div>
          <div style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700, color: '#64748B', marginBottom: 8 }}>No budgets yet</div>
          <p style={{ fontSize: 14, marginBottom: 24 }}>Set monthly limits to track your spending</p>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Create your first budget</button>
        </div>
      )}

      {/* Modals */}
      {editItem && (
        <EditModal item={editItem} onSave={handleSave} onClose={() => setEditItem(null)} />
      )}
      {showAdd && (
        <AddBudgetModal existing={existingCats} onSave={handleSave} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}