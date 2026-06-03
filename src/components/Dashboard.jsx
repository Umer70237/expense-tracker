import React, { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { fmt, fmtDate, CATEGORIES } from '../utils/helpers.js'

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, glow }) {
  return (
    <div className="glass rounded-2xl p-5 animate-slide-up" style={{ boxShadow: glow }}>
      <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div className="num" style={{ fontSize: 26, fontFamily: 'JetBrains Mono', fontWeight: 600, color, letterSpacing: '-0.03em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Custom tooltip for recharts ──────────────────────────────────────────────
function CTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ct">
      {label && <div className="ct-label">{label}</div>}
      {payload.map(p => (
        <div key={p.name} className="ct-row">
          <span className="ct-dot" style={{ background: p.color }} />
          <span style={{ color: '#94A3B8', fontSize: 12 }}>{p.name}</span>
          <span className="ct-val" style={{ color: p.color, marginLeft: 'auto', paddingLeft: 12 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Recent transaction row ───────────────────────────────────────────────────
function TxRow({ expense, onClick }) {
  const cat = CATEGORIES[expense.category] || CATEGORIES.other
  const isIncome = expense.type === 'income'
  return (
    <div
      onClick={onClick}
      className="glass-hover"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        border: '1px solid transparent',
        transition: 'all 0.15s',
      }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>{cat.emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expense.description}
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
          {cat.label} · {fmtDate(expense.date)}
          {expense.recurring && <span style={{ marginLeft: 6, color: '#F59E0B', fontSize: 10 }}>↻ recurring</span>}
        </div>
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 15,
        color: isIncome ? '#10B981' : '#F1F5F9',
        letterSpacing: '-0.02em',
      }}>
        {isIncome ? '+' : '−'}{fmt(expense.amount)}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard({ setView }) {
  const { expenses, totalIncome, totalExpenses, balance, savingsRate, monthlyData, pieData } = useExpenses()

  const recent = useMemo(() =>
    [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
  , [expenses])

  const thisMonthExpenses = useMemo(() => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return expenses.filter(e => e.type === 'expense' && e.date.startsWith(prefix))
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  const positive = balance >= 0

  return (
    <div style={{ padding: '28px 28px 100px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em', margin: 0 }}>
          Overview
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard
          label="NET BALANCE"
          value={fmt(Math.abs(balance), true)}
          sub={positive ? '▲ Positive balance' : '▼ In deficit'}
          color={positive ? '#10B981' : '#F43F5E'}
          glow={positive ? '0 0 30px rgba(16,185,129,0.12)' : '0 0 30px rgba(244,63,94,0.12)'}
        />
        <StatCard
          label="TOTAL INCOME"
          value={fmt(totalIncome, true)}
          sub={`${expenses.filter(e => e.type === 'income').length} transactions`}
          color="#10B981"
        />
        <StatCard
          label="TOTAL SPENT"
          value={fmt(totalExpenses, true)}
          sub={`${expenses.filter(e => e.type === 'expense').length} transactions`}
          color="#F43F5E"
        />
        <StatCard
          label="THIS MONTH"
          value={fmt(thisMonthExpenses, true)}
          sub="Expenses so far"
          color="#F59E0B"
        />
        <StatCard
          label="SAVINGS RATE"
          value={`${savingsRate.toFixed(1)}%`}
          sub={savingsRate >= 20 ? '🎯 Great savings!' : 'Try to save more'}
          color="#8B5CF6"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Monthly bar chart */}
        <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Monthly Flow
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barGap={3} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="income"   name="Income"  fill="#10B981" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Spent"   fill="#F43F5E" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category donut */}
        <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Spending Breakdown
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    dataKey="value" paddingAngle={3} stroke="none">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pieData.slice(0, 5).map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#94A3B8', flex: 1 }}>{d.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#F1F5F9' }}>{fmt(d.value, true)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', paddingTop: 40 }}>No expenses yet</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '180ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
            Recent Transactions
          </div>
          <button
            onClick={() => setView('transactions')}
            style={{ fontSize: 13, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}>
            View all →
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#475569', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💸</div>
            <p>No transactions yet</p>
            <button className="btn-primary" onClick={() => setView('add')} style={{ marginTop: 8 }}>
              Add your first transaction
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recent.map(e => <TxRow key={e.id} expense={e} onClick={() => setView('transactions')} />)}
          </div>
        )}
      </div>
    </div>
  )
}