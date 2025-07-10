import { useState, useEffect, createContext } from 'react';
import '../styles/globals.css';

// Create a theme context
export const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  toggleTheme: () => {},
});

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);

    // Apply the theme to the document
    applyTheme(savedTheme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (currentTheme) => {
    const isDark = 
      currentTheme === 'dark' || 
      (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.classList.toggle('dark-theme', isDark);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Function to toggle between themes (light -> dark -> light)
  const toggleTheme = () => {
    // Only toggle between light and dark
    const themeOrder = ['light', 'dark'];

    // If current theme is system, default to light when toggling
    const effectiveTheme = theme === 'system' ? 'light' : theme;
    const currentIndex = themeOrder.indexOf(effectiveTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];

    handleThemeChange(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange, toggleTheme }}>
      <Component {...pageProps} />
    </ThemeContext.Provider>
  );
}

export default MyApp;
