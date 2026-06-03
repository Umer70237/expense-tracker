import React from 'react'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { fmt } from '../utils/helpers.js'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',     icon: '⬡' },
  { id: 'add',          label: 'Add',            icon: '+' },
  { id: 'transactions', label: 'Transactions',   icon: '≡' },
  { id: 'charts',       label: 'Analytics',      icon: '◎' },
  { id: 'budgets',      label: 'Budgets',        icon: '◫' },
]

export default function Sidebar({ view, setView }) {
  const { balance, totalExpenses, totalIncome } = useExpenses()
  const positive = balance >= 0

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col h-full"
        style={{ width: 220, flexShrink: 0, background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo */}
        <div className="px-6 pt-7 pb-6">
          <div className="display font-display font-extrabold text-xl tracking-tight"
            style={{ color: '#F59E0B', letterSpacing: '-0.03em' }}>
            Cashflowy
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>
            SMART TRACKER
          </div>
        </div>

        {/* Balance card */}
        <div className="mx-4 mb-6 p-4 rounded-2xl gradient-border">
          <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.06em', marginBottom: 4 }}>NET BALANCE</div>
          <div className="num font-mono font-semibold" style={{ fontSize: 22, color: positive ? '#10B981' : '#F43F5E' }}>
            {fmt(Math.abs(balance))}
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.06em' }}>IN</div>
              <div className="num" style={{ fontSize: 13, color: '#10B981', fontFamily: 'JetBrains Mono' }}>{fmt(totalIncome, true)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.06em' }}>OUT</div>
              <div className="num" style={{ fontSize: 13, color: '#F43F5E', fontFamily: 'JetBrains Mono' }}>{fmt(totalExpenses, true)}</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3">
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => setView(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 2,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: view === item.id ? 600 : 400,
                background: view === item.id ? 'rgba(245,158,11,0.12)' : 'transparent',
                color: view === item.id ? '#F59E0B' : '#94A3B8',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (view !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (view !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {view === item.id && (
                <span style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#475569' }}>
          Data saved locally in your browser
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: 'rgba(8,8,16,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(item => (
          <button key={item.id}
            onClick={() => setView(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: view === item.id ? '#F59E0B' : '#64748B',
              fontSize: 9,
              fontFamily: 'DM Sans',
              fontWeight: 500,
              letterSpacing: '0.05em',
              transition: 'color 0.15s',
            }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </>
  )
}