import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import { ThemeContext } from './_app';

export default function PriceComparison() {
  const { theme, setTheme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const suggestionRef = useRef(null);

  // Handle clicks outside the suggestion dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions as user types
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set a timeout to avoid making too many requests while typing
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-suggestions?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Optionally, submit the search immediately
    handleSubmit(null, suggestion);
  };

  // Handle form submission
  const handleSubmit = async (e, selectedQuery = null) => {
    if (e) e.preventDefault();

    const query = selectedQuery || searchQuery;

    if (!query) {
      setError('Please enter a product name');
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(`/api/compare-prices?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setComparisonResults(null);
      } else {
        setComparisonResults(data);
      }
    } catch (err) {
      setError('Failed to compare prices. Please try again.');
      console.error('Error comparing prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render a skeleton loader for the comparison table
  const renderSkeletonTable = () => {
    return (
      <div className={styles.comparisonContainer}>
        <div className={`${styles.skeletonTitle} ${styles.skeleton}`}></div>
        <div className={styles.tableContainer}>
          <div className={`${styles.skeletonRow} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonRow} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonRow} ${styles.skeleton}`}></div>
          <div className={`${styles.skeletonRow} ${styles.skeleton}`}></div>
        </div>
      </div>
    );
  };

  // Render the comparison results table
  const renderComparisonTable = () => {
    if (!comparisonResults || comparisonResults.length === 0) {
      return <p>No comparison results found for this product.</p>;
    }

    return (
      <div className={styles.tableContainer}>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Price</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Availability</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {comparisonResults.map((result, index) => (
              <tr key={index} className={styles.resultRow}>
                <td className={styles.platformCell}>
                  <div className={styles.platformName}>{result.platform}</div>
                </td>
                <td className={styles.priceCell}>{result.price}</td>
                <td className={styles.nameCell}>{result.name}</td>
                <td className={styles.ratingCell}>{result.rating}</td>
                <td className={styles.availabilityCell}>{result.availability}</td>
                <td className={styles.linkCell}>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className={styles.viewButton}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          <title>Price Comparison - Basics</title>
          <meta name="description" content="Compare prices across Indian e-commerce platforms" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>Price Comparison</h1>
          <p className={styles.description}>
            Search for a product to compare prices and specifications across multiple Indian e-commerce platforms.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.searchContainer} ref={suggestionRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for a product (e.g., iPhone 16 Pro, MacBook Air)"
                className={styles.input}
                style={{ width: '100%' }}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsDropdown}>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={styles.suggestionItem}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Comparing...' : 'Compare Prices'}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.comparisonResults}>
            {loading ? renderSkeletonTable() : (comparisonResults && renderComparisonTable())}
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <p><small>Copyright 2025</small></p>
      </footer>
    </>
  );
}
