import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { ThemeContext } from './_app';

export default function BudgetTracker() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [salaries, setSalaries] = useState([{ id: 1, description: '', amount: '' }]);
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Home', description: 'Rent/Mortgage', amount: '' },
    { id: 2, category: 'Utilities', description: 'Internet', amount: '' },
    { id: 3, category: 'Utilities', description: 'Phone', amount: '' },
    { id: 4, category: 'Utilities', description: 'Electricity', amount: '' },
    { id: 5, category: 'Education', description: 'School', amount: '' },
    { id: 6, category: 'Health', description: 'Medicine', amount: '' },
    { id: 7, category: 'Other', description: 'Others', amount: '' }
  ]);
  const [customCategory, setCustomCategory] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedBudget = localStorage.getItem('budget');
    if (savedBudget) {
      try {
        const { salaries, expenses } = JSON.parse(savedBudget);
        setSalaries(salaries);
        setExpenses(expenses);
      } catch (err) {
        console.error('Error parsing saved budget:', err);
      }
    }
  }, []);

  // Save data to localStorage whenever salaries or expenses change
  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify({ salaries, expenses }));
  }, [salaries, expenses]);

  // Show saved message briefly when data is saved
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => {
        setSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  // Calculate totals
  const totalSalary = salaries.reduce((sum, salary) => {
    const amount = parseFloat(salary.amount) || 0;
    return sum + amount;
  }, 0);

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = parseFloat(expense.amount) || 0;
    return sum + amount;
  }, 0);

  const balance = totalSalary - totalExpenses;
  const savings = balance > 0 ? balance : 0;

  // Handle adding a new salary entry
  const handleAddSalary = () => {
    const newId = salaries.length > 0 ? Math.max(...salaries.map(s => s.id)) + 1 : 1;
    setSalaries([...salaries, { id: newId, description: '', amount: '' }]);
  };

  // Handle removing a salary entry
  const handleRemoveSalary = (id) => {
    if (salaries.length > 1) {
      setSalaries(salaries.filter(salary => salary.id !== id));
    }
  };

  // Handle salary input changes
  const handleSalaryChange = (id, field, value) => {
    setSalaries(salaries.map(salary => {
      if (salary.id === id) {
        return { ...salary, [field]: value };
      }
      return salary;
    }));
    setSaved(true);
  };

  // Handle expense input changes
  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(expense => {
      if (expense.id === id) {
        return { ...expense, [field]: value };
      }
      return expense;
    }));
    setSaved(true);
  };

  // Handle adding a custom expense category
  const handleAddCustomExpense = (e) => {
    e.preventDefault();

    if (!customCategory || !customDescription) {
      setError('Please enter both category and description');
      return;
    }

    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    setExpenses([...expenses, { 
      id: newId, 
      category: customCategory, 
      description: customDescription, 
      amount: '' 
    }]);

    // Reset form
    setCustomCategory('');
    setCustomDescription('');
    setError(null);
    setSaved(true);
  };

  // Handle removing an expense entry
  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    setSaved(true);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Link href="/">Basics</Link>
          </div>
          <div className={styles.navigation}>
            <Link href="/" className={styles.navLink}>
              News
            </Link>
            <Link href="/price-comparison" className={styles.navLink}>
              Price Comparison
            </Link>
            <Link href="/budget-tracker" className={styles.navLink}>
              Budget Tracker
            </Link>
            <Link href="/secret-santa" className={styles.navLink}>
              Secret Santa
            </Link>
          </div>
          <div className={styles.themeToggle}>
            <button 
              className={styles.themeButton}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Current theme: ${theme}. Click to change.`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <Head>
          <title>Budget Tracker - Basics</title>
          <meta name="description" content="Track your income and expenses with our simple budget tracker" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Simple Budget Tracker</h1>
          <p className={styles.description}>
            Track your income and expenses to manage your finances better.
            Your data is saved locally in your browser.
          </p>

          {saved && (
            <div className={styles.savedMessage}>
              Data saved to browser storage!
            </div>
          )}

          {/* Summary Section */}
          <div className={styles.budgetContainer}>
            <div className={styles.summaryRow}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Income:</span>
                <span className={styles.priceCell}>₹{totalSalary.toFixed(2)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Expenses:</span>
                <span className={styles.priceCell}>₹{totalExpenses.toFixed(2)}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Balance:</span>
                <span className={`${styles.priceCell} ${balance < 0 ? styles.negativeBalance : ''}`}>
                  ₹{balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.feedsRow}>
            {/* Salary Section */}
            <div className={styles.feedContainer}>
              <h2 className={styles.feedTitle}>Income</h2>

              {salaries.map((salary, index) => (
                <div key={salary.id} className={styles.salaryItem}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={salary.description}
                      onChange={(e) => handleSalaryChange(salary.id, 'description', e.target.value)}
                      placeholder="Salary description"
                      className={styles.input}
                      style={{ borderRadius: '8px 0 0 8px' }}
                    />
                    <input
                      type="number"
                      value={salary.amount}
                      onChange={(e) => handleSalaryChange(salary.id, 'amount', e.target.value)}
                      placeholder="Amount"
                      className={styles.input}
                      style={{ borderRadius: '0 8px 8px 0', width: '120px' }}
                    />
                    {salaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSalary(salary.id)}
                        className={styles.removeButton}
                        aria-label="Remove salary"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSalary}
                className={styles.addButton}
              >
                + Add Another Income Source
              </button>
            </div>

            {/* Expenses Section */}
            <div className={styles.feedContainer}>
              <h2 className={styles.feedTitle}>Monthly Expenses</h2>

              {expenses.map((expense) => (
                <div key={expense.id} className={styles.expenseItem}>
                  <div className={styles.expenseCategory}>{expense.category}</div>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={expense.description}
                      onChange={(e) => handleExpenseChange(expense.id, 'description', e.target.value)}
                      placeholder="Description"
                      className={styles.input}
                      style={{ borderRadius: '8px 0 0 8px' }}
                    />
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => handleExpenseChange(expense.id, 'amount', e.target.value)}
                      placeholder="Amount"
                      className={styles.input}
                      style={{ borderRadius: '0 8px 8px 0', width: '120px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExpense(expense.id)}
                      className={styles.removeButton}
                      aria-label="Remove expense"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <div className={styles.customExpenseForm}>
                <h3>Add Custom Expense</h3>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleAddCustomExpense}>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Category"
                      className={styles.input}
                      style={{ borderRadius: '8px 0 0 0' }}
                    />
                    <input
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Description"
                      className={styles.input}
                      style={{ borderRadius: '0 8px 0 0' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className={styles.button}
                    style={{ width: '100%', borderRadius: '0 0 8px 8px' }}
                  >
                    Add Custom Expense
                  </button>
                </form>
              </div>
            </div>


          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <p><small>Copyright 2025</small></p>
      </footer>
    </>
  );
}
