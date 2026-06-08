'use client';

import { useState } from 'react';
import { SimpleGrid, Stack } from '@mantine/core';

import Navbar from '@/lib/components/Navbar';
import { KNOWN_CURRENCIES } from '@/lib/constants';
import SwapModule from '@/lib/components/SwapModule';
import BalanceModule from '@/lib/components/BalanceModule';
import WithdrawModule from '@/lib/components/WithdrawModule';
import TransactionsModule from '@/lib/components/TransactionsModule';

export default function WalletPage() {
  const currencyOptions = KNOWN_CURRENCIES.map((c) => ({ value: c, label: c }));
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerUpdate = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <>
      <Navbar />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md" p="lg">
        <Stack gap="md">
          <BalanceModule currencyOptions={currencyOptions} refreshTrigger={refreshTrigger} />
          <TransactionsModule refreshTrigger={refreshTrigger} />
        </Stack>

        <Stack gap="md">
          <SwapModule currencyOptions={currencyOptions} onSuccess={triggerUpdate} />
          <WithdrawModule currencyOptions={currencyOptions} onSuccess={triggerUpdate} />
        </Stack>
      </SimpleGrid>
    </>
  );
}
