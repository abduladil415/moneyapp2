import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { useData } from '../state/DataContext';
import { buildSnapshot, calculateNetWorth, groupByKey, withValue } from '../state/selectors';

const COLORS = ['#1d4ed8', '#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#f43f5e'];

function StatCard({ label, value, helper }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {helper && <div className="stat-card__helper">{helper}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { accounts, holdings, snapshots, saveSnapshot } = useData();

  const netWorth = useMemo(() => calculateNetWorth(accounts, holdings), [accounts, holdings]);
  const holdingValues = useMemo(() => holdings.map(withValue), [holdings]);

  const chartData = useMemo(
    () =>
      [...snapshots]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((snapshot) => ({
          date: format(new Date(snapshot.timestamp), 'MMM d'),
          netWorth: snapshot.netWorth,
        })),
    [snapshots]
  );

  const allocationByAsset = useMemo(() => {
    const grouped = groupByKey(holdingValues, 'assetClass');
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [holdingValues]);

  const allocationByAccount = useMemo(() => {
    const grouped = groupByKey(holdingValues, 'accountId');
    const lookup = Object.fromEntries(accounts.map((acct) => [acct.id, acct.name]));
    return Object.entries(grouped).map(([id, value]) => ({ name: lookup[id] || id, value }));
  }, [holdingValues, accounts]);

  const topHoldings = useMemo(() => {
    return [...holdingValues]
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 5)
      .map((holding) => ({
        ...holding,
        weight: netWorth ? (holding.marketValue / netWorth) * 100 : 0,
      }));
  }, [holdingValues, netWorth]);

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';

  const saveCurrentSnapshot = () => {
    const snapshot = buildSnapshot({ accounts, holdings });
    saveSnapshot(snapshot);
  };

  const getChange = (days) => {
    if (!snapshots.length) return '—';
    const now = Date.now();
    const pastSnapshot = [...snapshots]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .find((snapshot) => now - new Date(snapshot.timestamp).getTime() >= days * 24 * 60 * 60 * 1000);
    if (!pastSnapshot) return '—';
    const diff = netWorth - pastSnapshot.netWorth;
    const prefix = diff >= 0 ? '+' : '-';
    return `${prefix}${formatCurrency(Math.abs(diff))}`;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Full visibility into your personal balance sheet.</p>
        </div>
        <button className="primary" onClick={saveCurrentSnapshot}>
          Save Snapshot
        </button>
      </header>

      <section className="grid grid-4">
        <StatCard label="Net Worth" value={formatCurrency(netWorth)} helper="Total across all accounts" />
        <StatCard label="Change (1d)" value={getChange(1)} />
        <StatCard label="Change (7d)" value={getChange(7)} />
        <StatCard label="Change (30d)" value={getChange(30)} />
      </section>

      <section className="panel">
        <div className="panel__title">Net Worth Over Time</div>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="netWorth" stroke="#2563eb" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">Capture a snapshot to unlock trend charts.</p>
        )}
      </section>

      <section className="grid grid-2">
        <div className="panel">
          <div className="panel__title">Allocation by Asset Class</div>
          {allocationByAsset.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocationByAsset} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120}>
                  {allocationByAsset.map((entry, index) => (
                    <Cell key={`asset-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">Add holdings to view allocation.</p>
          )}
        </div>
        <div className="panel">
          <div className="panel__title">Allocation by Account</div>
          {allocationByAccount.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={allocationByAccount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">Allocation chart appears after you add data.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">Top Positions</div>
        <div className="table">
          <div className="table__head">
            <div>Ticker</div>
            <div>Name</div>
            <div>Value</div>
            <div>Weight</div>
          </div>
          {topHoldings.length ? (
            topHoldings.map((holding) => (
              <div className="table__row" key={holding.id}>
                <div>{holding.ticker}</div>
                <div>{holding.name}</div>
                <div>{formatCurrency(holding.marketValue)}</div>
                <div>{holding.weight.toFixed(1)}%</div>
              </div>
            ))
          ) : (
            <div className="empty-state">Add holdings to populate your top positions.</div>
          )}
        </div>
      </section>
    </div>
  );
}
