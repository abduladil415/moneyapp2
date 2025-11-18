import React, { createContext, useContext, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { DEFAULT_STRATEGY_BUCKETS, STORAGE_KEYS } from '../data/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DataContext = createContext();

const defaultSettings = {
  strategyBuckets: DEFAULT_STRATEGY_BUCKETS,
  defaultTimeframe: '30d',
  chartTimeframes: ['7d', '30d', '90d', '1y'],
};

export function DataProvider({ children }) {
  const [accounts, setAccounts] = useLocalStorage(STORAGE_KEYS.accounts, []);
  const [holdings, setHoldings] = useLocalStorage(STORAGE_KEYS.holdings, []);
  const [snapshots, setSnapshots] = useLocalStorage(STORAGE_KEYS.snapshots, []);
  const [settings, setSettings] = useLocalStorage(STORAGE_KEYS.settings, defaultSettings);
  const [scenarioOverrides, setScenarioOverrides] = useState({});

  const addAccount = (account) => {
    setAccounts([...accounts, { ...account, id: nanoid() }]);
  };

  const updateAccount = (id, changes) => {
    setAccounts(accounts.map((acct) => (acct.id === id ? { ...acct, ...changes } : acct)));
  };

  const deleteAccount = (id) => {
    setAccounts(accounts.filter((acct) => acct.id !== id));
    setHoldings(holdings.filter((holding) => holding.accountId !== id));
  };

  const addHolding = (holding) => {
    setHoldings([...holdings, { ...holding, id: nanoid(), lastUpdated: holding.lastUpdated || new Date().toISOString() }]);
  };

  const updateHolding = (id, changes) => {
    setHoldings(
      holdings.map((holding) => (holding.id === id ? { ...holding, ...changes, lastUpdated: new Date().toISOString() } : holding))
    );
  };

  const deleteHolding = (id) => {
    setHoldings(holdings.filter((holding) => holding.id !== id));
  };

  const saveSnapshot = (snapshot) => {
    setSnapshots([...snapshots, { id: nanoid(), ...snapshot }]);
  };

  const exportData = () =>
    JSON.stringify({
      accounts,
      holdings,
      snapshots,
      settings,
    });

  const importData = (payload) => {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (parsed.accounts) setAccounts(parsed.accounts);
    if (parsed.holdings) setHoldings(parsed.holdings);
    if (parsed.snapshots) setSnapshots(parsed.snapshots);
    if (parsed.settings) setSettings(parsed.settings);
  };

  const value = useMemo(
    () => ({
      accounts,
      holdings,
      snapshots,
      settings,
      scenarioOverrides,
      setScenarioOverrides,
      setSettings,
      addAccount,
      updateAccount,
      deleteAccount,
      addHolding,
      updateHolding,
      deleteHolding,
      saveSnapshot,
      exportData,
      importData,
    }),
    [accounts, holdings, snapshots, settings, scenarioOverrides]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
