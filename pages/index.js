import Head from 'next/head';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { ThemeContext } from './_app';

export default function Home({ feeds }) {
  const { theme, setTheme, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Function to refresh feeds with animation
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Render a skeleton loader for feed containers
  const renderSkeletonContainer = (index) => {
    return (
      <div key={index} className={styles.feedContainer}>
        <div className={`${styles.skeletonTitle} ${styles.skeleton}`}></div>
        <ul className={styles.feedList}>
          {[...Array(5)].map((_, itemIndex) => (
            <li key={itemIndex} className={styles.feedItem}>
              <div className={`${styles.skeletonText} ${styles.skeleton}`} style={{ height: '20px', marginBottom: '10px' }}></div>
              <div className={`${styles.skeletonText} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonText} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonText} ${styles.skeleton}`}></div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render a feed container for each feed
  const renderFeedContainer = (feed, index) => {
    return (
      <div key={index} className={styles.feedContainer}>
        <h2 className={styles.feedTitle}>{feed.title}</h2>
        {feed.items.length === 0 ? (
          <p>No items found in the feed.</p>
        ) : (
          <ul className={styles.feedList}>
            {feed.items.slice(0, 5).map((item, itemIndex) => (
              <li key={itemIndex} className={styles.feedItem}>
                <h3>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                {item.pubDate && <p className={styles.date}>{new Date(item.pubDate).toLocaleString()}</p>}
                {item.creator && <p className={styles.author}>By {item.creator}</p>}
                {item.contentSnippet && <p className={styles.snippet}>{item.contentSnippet.substring(0, 150)}...</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>Basics</div>
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
              Secret Swap
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
          <title>Basics</title>
          <meta name="description" content="Your daily Basics + news and updates" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="theme-color" content="#4caf50" />
        </Head>

        <main className={styles.main}>
          <div className={styles.feedsRow}>
            {loading ? (
              // Show skeleton loaders when loading
              [0, 1, 2].map((index) => renderSkeletonContainer(index))
            ) : (
              // Show actual feed containers when loaded
              feeds.map((feed, index) => renderFeedContainer(feed, index))
            )}
          </div>
        </main>
      </div>

      <button
        className={`${styles.refreshButton} ${refreshing ? styles.refreshing : ''}`}
        onClick={handleRefresh}
        aria-label="Refresh feeds"
        title="Refresh feeds"
      >
        ↻
      </button>

      <footer className={styles.footer}>
        <p><small>Copyright 2025</small></p>
      </footer>
    </>
  );
}

export async function getStaticProps() {
  // Hardcoded RSS feed URLs
  const feedUrls = [
    'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.macrumors.com/MacRumors-All',
    'https://techcrunch.com/feed/',
    'https://www.wired.com/feed/rss',
    'https://feeds.bbci.co.uk/tamil/rss.xml',
    'https://www.vikatan.com/api/v1/collections/latest-news.rss?&time-period=last-24-hours',
    'https://www.vikatan.com/api/v1/collections/automobile.rss?&time-period=last-24-hours',
    'https://tamil.oneindia.com/rss/feeds/oneindia-tamil-fb.xml'
  ];

  try {
    const Parser = require('rss-parser');
    const parser = new Parser();

    // Fetch all feeds in parallel
    const feedPromises = feedUrls.map(url => parser.parseURL(url));
    const feedResults = await Promise.all(feedPromises);

    // Process the feeds to include only necessary data
    const feeds = feedResults.map(feed => ({
      title: feed.title || '',
      description: feed.description || '',
      link: feed.link || '',
      items: feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || null,
        creator: item.creator || item.author || null,
        contentSnippet: item.contentSnippet || item.summary || ''
      }))
    }));

    return {
      props: {
        feeds,
      },
      // Revalidate the data every 10 minutes
      revalidate: 600,
    };
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return {
      props: {
        feeds: [],
      },
      revalidate: 600,
    };
  }
}
