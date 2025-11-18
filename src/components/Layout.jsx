import React from 'react';
import './layout.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'settings', label: 'Settings' },
];

export function Layout({ route, onNavigate, children }) {
  return (
    <div className="app-shell">
      <aside className="app-shell__nav">
        <div className="brand">MoneyScope</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${route === item.id ? 'nav-link--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
