import React, { useState, useMemo } from 'react'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { fmt, fmtDate, CATEGORIES } from '../utils/helpers.js'

// ─── CSV export ───────────────────────────────────────────────────────────────
const exportCSV = (expenses) => {
  const header = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Note', 'Recurring']
  const rows = expenses.map(e => [
    e.date,
    e.type,
    CATEGORIES[e.category]?.label || e.category,
    `"${e.description}"`,
    e.amount,
    `"${e.note || ''}"`,
    e.recurring ? 'Yes' : 'No',
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'ledger-export.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function TxRow({ expense, onEdit, onDelete, deleting }) {
  const cat = CATEGORIES[expense.category] || CATEGORIES.other
  const isIncome = expense.type === 'income'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 16px',
      borderRadius: 12,
      border: '1px solid transparent',
      transition: 'all 0.15s',
      opacity: deleting ? 0.4 : 1,
    }}
    className="glass-hover"
    >
      {/* Category icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>{cat.emoji}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expense.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
          <span className="cat-pill" style={{ background: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
          <span style={{ fontSize: 12, color: '#475569' }}>{fmtDate(expense.date)}</span>
          {expense.recurring && (
            <span style={{ fontSize: 10, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 999 }}>
              ↻ {expense.recurringPeriod || 'recurring'}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 15,
        color: isIncome ? '#10B981' : '#F1F5F9',
        letterSpacing: '-0.02em',
        marginRight: 8,
        flexShrink: 0,
      }}>
        {isIncome ? '+' : '−'}{fmt(expense.amount)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onEdit(expense)}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: 14, color: '#94A3B8', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.color = '#F59E0B' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
          title="Edit">✎</button>
        <button onClick={() => onDelete(expense.id)}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: 14, color: '#94A3B8', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#F43F5E'; e.currentTarget.style.color = '#F43F5E' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94A3B8' }}
          title="Delete">✕</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ExpenseList({ onEdit }) {
  const { expenses, dispatch } = useExpenses()

  const [search,  setSearch]  = useState('')
  const [typeF,   setTypeF]   = useState('all')
  const [catF,    setCatF]    = useState('all')
  const [sortBy,  setSortBy]  = useState('date-desc')
  const [deleting, setDeleting] = useState(null)
  const [page,    setPage]    = useState(1)
  const PER_PAGE = 15

  const filtered = useMemo(() => {
    let list = [...expenses]

    if (search)         list = list.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || (CATEGORIES[e.category]?.label || '').toLowerCase().includes(search.toLowerCase()))
    if (typeF !== 'all') list = list.filter(e => e.type === typeF)
    if (catF  !== 'all') list = list.filter(e => e.category === catF)

    list.sort((a, b) => {
      if (sortBy === 'date-desc')   return b.date.localeCompare(a.date)
      if (sortBy === 'date-asc')    return a.date.localeCompare(b.date)
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc')  return a.amount - b.amount
      return 0
    })

    return list
  }, [expenses, search, typeF, catF, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const totalFiltered = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const totalIn       = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)

  const handleDelete = (id) => {
    setDeleting(id)
    setTimeout(() => {
      dispatch({ type: 'DELETE_EXPENSE', id })
      setDeleting(null)
    }, 300)
  }

  const uniqueCats = [...new Set(expenses.map(e => e.category))]

  return (
    <div style={{ padding: '28px 28px 100px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Transactions
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
            {expenses.length} total · {filtered.length} shown
          </p>
        </div>
        <button className="btn-ghost" onClick={() => exportCSV(filtered)} style={{ flexShrink: 0 }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Summary strip */}
      <div className="glass rounded-xl animate-fade-in" style={{ display: 'flex', gap: 0, overflow: 'hidden', marginBottom: 18 }}>
        {[
          { label: 'FILTERED EXPENSES', val: fmt(totalFiltered), color: '#F43F5E' },
          { label: 'FILTERED INCOME',   val: fmt(totalIn),        color: '#10B981' },
          { label: 'NET',               val: fmt(totalIn - totalFiltered), color: totalIn >= totalFiltered ? '#10B981' : '#F43F5E' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '14px 20px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.08em' }}>{s.label}</div>
            <div className="num" style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 17, color: s.color, marginTop: 3 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 14 }}>🔍</span>
          <input
            className="field"
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Type */}
        <select className="field" value={typeF} onChange={e => { setTypeF(e.target.value); setPage(1) }} style={{ flex: '0 0 130px' }}>
          <option value="all">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Category */}
        <select className="field" value={catF} onChange={e => { setCatF(e.target.value); setPage(1) }} style={{ flex: '0 0 150px' }}>
          <option value="all">All categories</option>
          {uniqueCats.map(c => (
            <option key={c} value={c}>{CATEGORIES[c]?.emoji} {CATEGORIES[c]?.label || c}</option>
          ))}
        </select>

        {/* Sort */}
        <select className="field" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ flex: '0 0 160px' }}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>

        {/* Clear */}
        {(search || typeF !== 'all' || catF !== 'all') && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setTypeF('all'); setCatF('all'); setPage(1) }}
            style={{ padding: '9px 14px', fontSize: 13 }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="glass rounded-2xl p-3">
        {paginated.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <p>No transactions match your filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginated.map(e => (
              <TxRow
                key={e.id}
                expense={e}
                onEdit={onEdit}
                onDelete={handleDelete}
                deleting={deleting === e.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ opacity: page === 1 ? 0.3 : 1, padding: '8px 16px' }}>
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n}
              onClick={() => setPage(n)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: page === n ? '#F59E0B' : 'rgba(255,255,255,0.06)',
                color: page === n ? '#000' : '#94A3B8',
                fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
              }}>
              {n}
            </button>
          ))}
          <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ opacity: page === totalPages ? 0.3 : 1, padding: '8px 16px' }}>
            Next →
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div style={{ marginTop: 40, padding: '16px 20px', borderRadius: 12, border: '1px solid rgba(244,63,94,0.15)', background: 'rgba(244,63,94,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F43F5E' }}>Clear all transactions</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>This action cannot be undone</div>
          </div>
          <button
            onClick={() => { if (window.confirm('Delete ALL transactions? This cannot be undone.')) dispatch({ type: 'CLEAR_ALL' }) }}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)', color: '#F43F5E', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans', fontWeight: 500 }}>
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}