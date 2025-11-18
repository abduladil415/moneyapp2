import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ASSET_CLASSES } from '../data/constants';
import { useData } from '../state/DataContext';
import { calculateNetWorth } from '../state/selectors';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#0ea5e9'];

export default function ScenarioPage() {
  const { accounts, holdings } = useData();
  const [overrides, setOverrides] = useState({});
  const [adjustments, setAdjustments] = useState({});

  const netWorth = useMemo(() => calculateNetWorth(accounts, holdings), [accounts, holdings]);
  const cashBalance = useMemo(
    () => accounts.filter((acct) => acct.accountType === 'Cash').reduce((sum, acct) => sum + (acct.balance || 0), 0),
    [accounts]
  );

  const scenarioHoldings = useMemo(() => {
    return holdings.map((holding) => {
      const direct = overrides[holding.ticker];
      const pct = adjustments[holding.assetClass] || 0;
      const price = typeof direct === 'number' && !Number.isNaN(direct) ? direct : holding.price * (1 + pct / 100);
      return {
        ...holding,
        scenarioPrice: price,
        scenarioValue: holding.quantity * price,
      };
    });
  }, [holdings, overrides, adjustments]);

  const scenarioNetWorth = useMemo(() => {
    const scenarioHoldingsTotal = scenarioHoldings.reduce((sum, holding) => sum + holding.scenarioValue, 0);
    return scenarioHoldingsTotal + cashBalance;
  }, [scenarioHoldings, cashBalance]);

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';

  const allocationData = useMemo(() => {
    const grouped = scenarioHoldings.reduce((acc, holding) => {
      acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.scenarioValue;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [scenarioHoldings]);

  const updateOverride = (ticker, value) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (value === '' || Number.isNaN(value)) {
        delete next[ticker];
      } else {
        next[ticker] = value;
      }
      return next;
    });
  };

  const updateAdjustment = (assetClass, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [assetClass]: value,
    }));
  };

  const quickSet = (tickers, pctChange) => {
    tickers.forEach((ticker) => {
      const holding = holdings.find((h) => h.ticker === ticker);
      if (holding) {
        const price = holding.price * (1 + pctChange / 100);
        updateOverride(ticker, Number(price.toFixed(2)));
      }
    });
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Scenario Analysis</h1>
          <p>Model future price paths and instantly see allocation shifts.</p>
        </div>
      </header>

      <section className="grid grid-3">
        <div className="stat-card">
          <div className="stat-card__label">Current Net Worth</div>
          <div className="stat-card__value">{formatCurrency(netWorth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Scenario Net Worth</div>
          <div className="stat-card__value">{formatCurrency(scenarioNetWorth)}</div>
          <div className="stat-card__helper">Includes overrides + adjustments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Delta</div>
          <div className="stat-card__value" style={{ color: scenarioNetWorth - netWorth >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatCurrency(scenarioNetWorth - netWorth)}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">Asset-Class Adjustments</div>
        <div className="grid grid-3">
          {ASSET_CLASSES.map((cls) => (
            <label key={cls}>
              <div>
                {cls}
                <small style={{ marginLeft: 6, color: '#94a3b8' }}>% shift</small>
              </div>
              <input
                type="number"
                value={adjustments[cls] ?? 0}
                onChange={(e) => updateAdjustment(cls, Number(e.target.value))}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">Direct Price Overrides</div>
        <div className="filters">
          <button className="secondary" onClick={() => quickSet(['BTC', 'BTC-USD'], 15)}>
            +15% Bitcoin
          </button>
          <button className="secondary" onClick={() => quickSet(['AMD'], 10)}>AMD +10%</button>
          <button className="secondary" onClick={() => quickSet(['NVDA'], 10)}>NVDA +10%</button>
          <button className="secondary" onClick={() => setOverrides({})}>Reset Overrides</button>
        </div>
        <div className="table">
          <div className="table__head">
            <div>Ticker</div>
            <div>Name</div>
            <div>Current Price</div>
            <div>Override</div>
            <div>Scenario Value</div>
          </div>
          {scenarioHoldings.map((holding) => (
            <div className="table__row" key={holding.id}>
              <div>{holding.ticker}</div>
              <div>{holding.name}</div>
              <div>{formatCurrency(holding.price)}</div>
              <div>
                <input
                  type="number"
                  value={overrides[holding.ticker] ?? ''}
                  placeholder="Leave blank"
                  onChange={(e) => updateOverride(holding.ticker, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>{formatCurrency(holding.scenarioValue)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">Scenario Allocation</div>
        {allocationData.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie dataKey="value" data={allocationData} outerRadius={130} label>
                {allocationData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">Add holdings to run scenarios.</p>
        )}
      </section>
    </div>
  );
}
