import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'var(--toggle-bg)',
        border: '1px solid var(--toggle-border)',
        cursor: 'pointer',
        color: 'var(--toggle-icon)',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--toggle-bg-hover)';
        e.currentTarget.style.borderColor = 'var(--toggle-border-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--toggle-bg)';
        e.currentTarget.style.borderColor = 'var(--toggle-border)';
      }}
    >
      {theme === 'dark'
        ? <Sun size={15} strokeWidth={2} />
        : <Moon size={15} strokeWidth={2} />
      }
    </button>
  );
}
