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
  const currencyOptions = KNOWN_CURRENCIES.map((c) => ({ value: c, label: c }));

  return (
    <Container size="xl" py="lg">
      <Navbar />

      <Grid gap="md">
        <BalanceModule currencyOptions={currencyOptions} />

        <SwapModule currencyOptions={currencyOptions} />

        <TransactionsModule />

        <WithdrawModule currencyOptions={currencyOptions} />
      </Grid>
    </Container>
  );
}
