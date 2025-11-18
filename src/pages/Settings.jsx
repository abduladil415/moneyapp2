import React, { useState } from 'react';
import { useData } from '../state/DataContext';

export default function SettingsPage() {
  const { settings, setSettings, exportData, importData } = useData();
  const [bucketInput, setBucketInput] = useState('');
  const [timeframeInput, setTimeframeInput] = useState(settings.defaultTimeframe);

  const addBucket = () => {
    if (!bucketInput) return;
    const next = Array.from(new Set([...(settings.strategyBuckets || []), bucketInput]));
    setSettings({ ...settings, strategyBuckets: next });
    setBucketInput('');
  };

  const removeBucket = (bucket) => {
    setSettings({
      ...settings,
      strategyBuckets: (settings.strategyBuckets || []).filter((item) => item !== bucket),
    });
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'moneyapp-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      importData(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Customize strategy labels, chart defaults, and backup data.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__title">Strategy Buckets</div>
        <div className="filters">
          <input placeholder="New bucket" value={bucketInput} onChange={(e) => setBucketInput(e.target.value)} />
          <button className="primary" type="button" onClick={addBucket}>
            Add Bucket
          </button>
        </div>
        <div className="badge-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(settings.strategyBuckets || []).map((bucket) => (
            <span className="badge" key={bucket} style={{ background: '#ecfccb', color: '#3f6212' }}>
              {bucket}
              <button
                className="secondary"
                style={{ marginLeft: 6, padding: '2px 8px' }}
                onClick={() => removeBucket(bucket)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel__title">Chart Defaults</div>
        <label>
          <div>Default Timeframe</div>
          <select value={timeframeInput} onChange={(e) => setTimeframeInput(e.target.value)}>
            {['7d', '30d', '90d', '1y'].map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </label>
        <button className="primary" type="button" style={{ marginTop: 12 }} onClick={() => setSettings({ ...settings, defaultTimeframe: timeframeInput })}>
          Save Timeframe
        </button>
      </section>

      <section className="panel">
        <div className="panel__title">Data Portability</div>
        <div className="filters">
          <button className="primary" type="button" onClick={handleExport}>
            Export JSON
          </button>
          <label className="secondary" style={{ padding: '10px 18px', cursor: 'pointer' }}>
            Import JSON
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
        <p className="empty-state">Export creates a portable backup of accounts, holdings, and snapshots.</p>
      </section>
    </div>
  );
}
