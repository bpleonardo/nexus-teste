'use client';

import { useEffect, useState } from 'react';
import { Container, Grid, Loader, Center } from '@mantine/core';
import { KNOWN_CURRENCIES } from '@/lib/constants';
import { getBalance, getTransactions, Balance, Transaction } from '@/lib/api/wallet';
import BalanceModule from '@/lib/components/BalanceModule';
import Navbar from '@/lib/components/Navbar';
import { TransactionsModule } from '@/lib/components/TransactionsModule';
import WithdrawModule from '@/lib/components/WithdrawModule';
import SwapModule from '@/lib/components/SwapModule';

export default function WalletPage() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Swap form state
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [balanceData, transactionsData] = await Promise.all([
          getBalance(),
          getTransactions(5),
        ]);
        setBalance(balanceData!);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currencyOptions = balance
    ? Object.keys(balance)
        .filter((c) => KNOWN_CURRENCIES.includes(c))
        .map((c) => ({ value: c, label: c }))
    : [];

  if (loading) {
    return (
      <Center p="xl" style={{ minHeight: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Container size="xl" py="lg">
      <Navbar />

      <Grid gap="md">
        <BalanceModule balance={balance} currencyOptions={currencyOptions} />

        <SwapModule currencyOptions={currencyOptions} />

        <TransactionsModule transactions={transactions} />

        <WithdrawModule currencyOptions={currencyOptions} />
      </Grid>
    </Container>
  );
}
