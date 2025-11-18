import React, { useMemo, useState } from 'react';
import { ACCOUNT_TYPES, TAX_TYPES } from '../data/constants';
import { useData } from '../state/DataContext';
import { computeAccountBalances } from '../state/selectors';

const emptyAccount = {
  name: '',
  institution: '',
  accountType: 'Taxable',
  taxType: 'Taxable',
  notes: '',
  balance: 0,
};

export default function AccountsPage() {
  const { accounts, holdings, addAccount, updateAccount, deleteAccount } = useData();
  const [form, setForm] = useState(emptyAccount);
  const [editingId, setEditingId] = useState(null);

  const accountBalances = useMemo(() => computeAccountBalances(accounts, holdings), [accounts, holdings]);

  const formatCurrency = (amount) =>
    amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) ?? '$0';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingId) {
      updateAccount(editingId, form);
    } else {
      addAccount(form);
    }
    setForm(emptyAccount);
    setEditingId(null);
  };

  const handleEdit = (account) => {
    setEditingId(account.id);
    setForm(account);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete account? Related holdings will be removed.')) {
      deleteAccount(id);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Accounts</h1>
          <p>Manage brokerage, retirement, and cash destinations.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__title">{editingId ? 'Edit Account' : 'Add Account'}</div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-3">
            <label>
              <div>Name</div>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              <div>Institution</div>
              <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            </label>
            <label>
              <div>Account Type</div>
              <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-2">
            <label>
              <div>Tax Type</div>
              <select value={form.taxType} onChange={(e) => setForm({ ...form, taxType: e.target.value })}>
                {TAX_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            {form.accountType === 'Cash' && (
              <label>
                <div>Cash Balance</div>
                <input
                  type="number"
                  value={form.balance || 0}
                  onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
                />
              </label>
            )}
          </div>
          <label>
            <div>Notes</div>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div>
            <button className="primary" type="submit">
              {editingId ? 'Update Account' : 'Add Account'}
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
        <div className="panel__title">Your Accounts</div>
        {accountBalances.length ? (
          <div className="table">
            <div className="table__head">
              <div>Name</div>
              <div>Type</div>
              <div>Balance</div>
              <div>Actions</div>
            </div>
            {accountBalances.map((account) => (
              <div className="table__row" key={account.id}>
                <div>
                  <div>{account.name}</div>
                  <div className="badge">{account.institution || 'N/A'}</div>
                </div>
                <div>
                  <div>{account.accountType}</div>
                  <small>{account.taxType}</small>
                </div>
                <div>{formatCurrency(account.balance)}</div>
                <div className="table-actions">
                  <button className="secondary" onClick={() => handleEdit(account)}>
                    Edit
                  </button>
                  <button className="secondary" onClick={() => handleDelete(account.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">Add accounts to get started.</p>
        )}
      </section>
    </div>
  );
}
