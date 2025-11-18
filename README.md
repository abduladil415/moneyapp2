# MoneyScope

MoneyScope is a local-first personal investment and net-worth cockpit built with React + Vite. It lets you:

- Model every account (401k, Roth IRA, brokerage, crypto, cash, etc.) and attach holdings with strategy buckets.
- View a live dashboard with total net worth, time-series trend, allocation charts, and top positions.
- Capture historical snapshots for longitudinal tracking.
- Run scenario analysis with hypothetical prices and asset-class shifts.
- Customize strategy buckets and back up / restore your entire dataset as JSON.

## Tech stack

- React 18
- Vite build tooling
- Recharts for data viz
- LocalStorage for persistence

## Getting started

```bash
npm install
npm run dev
```

The SPA stores data in your browser only. Use the Settings page to export/import JSON backups.
