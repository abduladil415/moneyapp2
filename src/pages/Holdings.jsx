import React, { useMemo, useState } from 'react';
import { ASSET_CLASSES } from '../data/constants';
import { useData } from '../state/DataContext';
import { calculateNetWorth, withValue } from '../state/selectors';

const emptyHolding = {
  accountId: '',
  ticker: '',
  name: '',
  assetClass: 'Stock',
  strategyBucket: 'Core Index',
  quantity: 0,
  price: 0,
  costBasis: 0,
  currency: 'USD',
};

export default function HoldingsPage() {
  const { accounts, holdings, settings, addHolding, updateHolding, deleteHolding } = useData();
  const [form, setForm] = useState(emptyHolding);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ assetClass: 'All', strategyBucket: 'All', search: '' });

  const netWorth = useMemo(() => calculateNetWorth(accounts, holdings), [accounts, holdings]);
  const valuedHoldings = useMemo(() => holdings.map(withValue), [holdings]);

  const filteredHoldings = useMemo(() => {
    return valuedHoldings.filter((holding) => {
      if (filters.assetClass !== 'All' && holding.assetClass !== filters.assetClass) return false;
      if (filters.strategyBucket !== 'All' && holding.strategyBucket !== filters.strategyBucket) return false;
      if (filters.search) {
        const term = filters.search.toLowerCase();
        if (!holding.ticker.toLowerCase().includes(term) && !holding.name.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [valuedHoldings, filters]);

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      updateHolding(editingId, form);
    } else {
      addHolding(form);
    }
    setForm(emptyHolding);
    setEditingId(null);
  };

  const handleEdit = (holding) => {
    setEditingId(holding.id);
    setForm(holding);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Holdings</h1>
          <p>Track every position, sizing, and conviction bucket.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__title">{editingId ? 'Edit Holding' : 'Add Holding'}</div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <label>
              <div>Account</div>
              <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required>
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <div>Ticker</div>
              <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })} />
            </label>
            <label>
              <div>Asset Name</div>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
          </div>
          <div className="grid grid-3">
            <label>
              <div>Asset Class</div>
              <select value={form.assetClass} onChange={(e) => setForm({ ...form, assetClass: e.target.value })}>
                {ASSET_CLASSES.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
            </label>
            <label>
              <div>Strategy Bucket</div>
              <select value={form.strategyBucket} onChange={(e) => setForm({ ...form, strategyBucket: e.target.value })}>
                {(settings.strategyBuckets || []).map((bucket) => (
                  <option key={bucket}>{bucket}</option>
                ))}
              </select>
            </label>
            <label>
              <div>Currency</div>
              <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </label>
          </div>
          <div className="grid grid-3">
            <label>
              <div>Quantity</div>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            </label>
            <label>
              <div>Current Price</div>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </label>
            <label>
              <div>Cost Basis (optional)</div>
              <input
                type="number"
                value={form.costBasis || ''}
                onChange={(e) => setForm({ ...form, costBasis: Number(e.target.value) })}
              />
            </label>
          </div>
          <div>
            <button className="primary" type="submit">
              {editingId ? 'Update Holding' : 'Add Holding'}
            </button>
            {editingId && (
              <button className="secondary" type="button" onClick={() => setEditingId(null)} style={{ marginLeft: 12 }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__title">Positions</div>
        <div className="filters">
          <select value={filters.assetClass} onChange={(e) => setFilters({ ...filters, assetClass: e.target.value })}>
            <option>All</option>
            {ASSET_CLASSES.map((cls) => (
              <option key={cls}>{cls}</option>
            ))}
          </select>
          <select value={filters.strategyBucket} onChange={(e) => setFilters({ ...filters, strategyBucket: e.target.value })}>
            <option>All</option>
            {(settings.strategyBuckets || []).map((bucket) => (
              <option key={bucket}>{bucket}</option>
            ))}
          </select>
          <input
            placeholder="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        {filteredHoldings.length ? (
          <div className="table holdings-table">
            <div className="table__head">
              <div>Ticker</div>
              <div>Name</div>
              <div>Asset Class</div>
              <div>Strategy</div>
              <div>Quantity</div>
              <div>Price</div>
              <div>Value</div>
              <div>Weight</div>
              <div>Gain/Loss</div>
              <div>Account</div>
              <div>Actions</div>
            </div>
            {filteredHoldings.map((holding) => {
              const account = accounts.find((acct) => acct.id === holding.accountId);
              const gainLoss = holding.costBasis ? holding.marketValue - holding.costBasis : null;
              const weight = netWorth ? ((holding.marketValue / netWorth) * 100).toFixed(1) : '0.0';
              return (
                <div className="table__row holdings-row" key={holding.id}>
                  <div>{holding.ticker}</div>
                  <div>{holding.name}</div>
                  <div>{holding.assetClass}</div>
                  <div>{holding.strategyBucket}</div>
                  <div>{holding.quantity}</div>
                  <div>{formatCurrency(holding.price)}</div>
                  <div>{formatCurrency(holding.marketValue)}</div>
                  <div>{weight}%</div>
                  <div>{gainLoss ? formatCurrency(gainLoss) : '—'}</div>
                  <div>{account?.name || '—'}</div>
                  <div className="table-actions">
                    <button className="secondary" onClick={() => handleEdit(holding)}>
                      Edit
                    </button>
                    <button className="secondary" onClick={() => deleteHolding(holding.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No holdings match your filters.</p>
        )}
      </section>
    </div>
  );
}
