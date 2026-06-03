import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import AddExpense from './components/AddExpense.jsx'
import ExpenseList from './components/ExpenseList.jsx'
import Charts from './components/Charts.jsx'
import Budgets from './components/Budgets.jsx'

export default function App() {
  const [view, setView] = useState('dashboard')
const [editExpense, setEditExpense] = useState(null)

const handleEdit = (expense) => {
  setEditExpense(expense)
  setView('add')
}

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} />
    case 'add':
  return <AddExpense editExpense={editExpense} setView={setView} />
    case 'transactions':
  return <ExpenseList onEdit={handleEdit} />
  
      case 'charts':
        return <Charts />
          case 'budgets':      
            return <Budgets />
      default:
        return <Dashboard setView={setView} />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar view={view} setView={setView} />
      <main style={{ flex: 1, padding: 20 }}>
        {renderView()}
      </main>
    </div>
  )
}