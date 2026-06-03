import React, { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useExpenses } from '../context/ExpenseContext.jsx'
import { fmt, CATEGORIES } from '../utils/helpers.js'

// ── Tooltip ──────────────────────────────────────────────────────────────────
function CTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="ct">
      {label && <div className="ct-label">{label}</div>}
      {payload.map(p => (
        <div key={p.name} className="ct-row">
          <span className="ct-dot" style={{ background: p.color || p.fill }} />
          <span style={{ color: '#94A3B8', fontSize: 12 }}>{p.name}</span>
          <span className="ct-val" style={{ color: p.color || p.fill, marginLeft: 'auto', paddingLeft: 12 }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Charts() {
  const { expenses, monthlyData, pieData, totalIncome, totalExpenses } = useExpenses()

  // Running balance data (day by day)
  const balanceData = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date))
    let running = 0
    const seen = {}
    sorted.forEach(e => {
      running += e.type === 'income' ? e.amount : -e.amount
      seen[e.date] = running
    })
    return Object.entries(seen).map(([date, balance]) => ({
      date: date.slice(5), // MM-DD
      balance,
    })).slice(-60)
  }, [expenses])

  // Top spending categories
  const topCats = useMemo(() => {
    const map = {}
    expenses.filter(e => e.type === 'expense').forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount
    })
    return Object.entries(map)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 8)
      .map(([key, amount]) => ({
        name: CATEGORIES[key]?.label || key,
        amount,
        color: CATEGORIES[key]?.color || '#888',
        emoji: CATEGORIES[key]?.emoji || '📦',
      }))
  }, [expenses])

  // Income vs expense by category
  const txCountByType = {
    expense: expenses.filter(e => e.type === 'expense').length,
    income:  expenses.filter(e => e.type === 'income').length,
  }

  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <div style={{ padding: '28px 28px 100px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="display" style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
          Analytics
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
          Visual breakdown of your financial activity
        </p>
      </div>

      {/* Summary pills */}
      <div className="animate-fade-in" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {[
          { label: 'Total income', val: fmt(totalIncome), color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Total expenses', val: fmt(totalExpenses), color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
          { label: 'Expense transactions', val: txCountByType.expense, color: '#F43F5E', bg: 'rgba(244,63,94,0.06)' },
          { label: 'Income transactions', val: txCountByType.income, color: '#10B981', bg: 'rgba(16,185,129,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 18px', borderRadius: 10, background: s.bg, border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: 10, color: '#64748B', letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 16, color: s.color, marginTop: 2 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* 1. Monthly income vs expenses bar */}
        <ChartCard title="Monthly Income vs Expenses" subtitle="Last 6 months comparison" delay={0}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={3} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="income"   name="Income"   fill="#10B981" radius={[5,5,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[5,5,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Spending by category pie */}
        <ChartCard title="Spending by Category" subtitle="All time breakdown" delay={60}>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                    stroke="none"
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.4}
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {pieData.slice(0, 6).map((d, i) => {
                  const pct = ((d.value / pieData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#94A3B8', flex: 1 }}>{d.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#64748B' }}>{pct}%</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: d.color }}>{fmt(d.value, true)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: '50px 0' }}>No expense data</div>
          )}
        </ChartCard>

        {/* 3. Running balance area chart */}
        <ChartCard title="Running Balance" subtitle="Daily net balance over time" delay={120}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="balGradNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#F43F5E" stopOpacity={0} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v.toFixed(0))} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CTooltip />} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#10B981" strokeWidth={2} fill="url(#balGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Top categories bar */}
        <ChartCard title="Top Spending Categories" subtitle="Horizontal breakdown" delay={180}>
          {topCats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topCats.map(cat => {
                const max = topCats[0].amount
                const pct = (cat.amount / max) * 100
                return (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{cat.emoji} {cat.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: cat.color }}>{fmt(cat.amount)}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#475569', padding: '50px 0' }}>No expense data</div>
          )}
        </ChartCard>

        {/* 5. Net savings per month — full width */}
        <div className="glass rounded-2xl p-6 animate-slide-up" style={{ gridColumn: '1 / -1', animationDelay: '240ms' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Net Savings per Month</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>Positive = saved money · Negative = over-spent</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip content={<CTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="net" name="Net Savings" radius={[6,6,0,0]}
                fill="#8B5CF6"
                label={false}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.net >= 0 ? '#10B981' : '#F43F5E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}