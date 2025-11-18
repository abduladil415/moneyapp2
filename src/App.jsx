import React from 'react';
import { Layout } from './components/Layout';
import { DataProvider } from './state/DataContext';
import { useHashRoute } from './hooks/useHashRoute';
import DashboardPage from './pages/Dashboard';
import AccountsPage from './pages/Accounts';
import HoldingsPage from './pages/Holdings';
import ScenarioPage from './pages/Scenario';
import SettingsPage from './pages/Settings';

const ROUTES = {
  dashboard: DashboardPage,
  accounts: AccountsPage,
  holdings: HoldingsPage,
  scenarios: ScenarioPage,
  settings: SettingsPage,
};

export default function App() {
  const [route, navigate] = useHashRoute('dashboard');
  const ActivePage = ROUTES[route] || DashboardPage;

  return (
    <DataProvider>
      <Layout route={route} onNavigate={navigate}>
        <ActivePage />
      </Layout>
    </DataProvider>
  );
}
