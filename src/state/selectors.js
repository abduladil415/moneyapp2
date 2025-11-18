export const withValue = (holding) => ({
  ...holding,
  marketValue: holding.quantity * holding.price,
});

export const computeAccountBalances = (accounts, holdings) => {
  return accounts.map((account) => {
    if (account.accountType === 'Cash') {
      return {
        ...account,
        balance: account.balance || 0,
      };
    }
    const total = holdings
      .filter((holding) => holding.accountId === account.id)
      .reduce((sum, holding) => sum + holding.quantity * holding.price, 0);
    return {
      ...account,
      balance: total,
    };
  });
};

export const calculateNetWorth = (accounts, holdings) => {
  const balances = computeAccountBalances(accounts, holdings);
  return balances.reduce((sum, account) => sum + (account.balance || 0), 0);
};

export const groupByKey = (items, key, valueSelector) => {
  return items.reduce((acc, item) => {
    const bucket = item[key] || 'Unspecified';
    const amount = valueSelector ? valueSelector(item) : item.marketValue;
    acc[bucket] = (acc[bucket] || 0) + amount;
    return acc;
  }, {});
};

export const buildSnapshot = ({ accounts, holdings }) => {
  const valuedHoldings = holdings.map(withValue);
  const netWorth = calculateNetWorth(accounts, holdings);

  const byAssetClass = groupByKey(valuedHoldings, 'assetClass');
  const byAccountType = groupByKey(
    valuedHoldings,
    'accountId',
    (holding) => holding.marketValue
  );
  const byStrategy = groupByKey(valuedHoldings, 'strategyBucket');

  return {
    timestamp: new Date().toISOString(),
    netWorth,
    byAssetClass,
    byAccountType,
    byStrategy,
  };
};
