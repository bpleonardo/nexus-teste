'use client';

import { SimpleGrid, Stack } from '@mantine/core';
import { KNOWN_CURRENCIES } from '@/lib/constants';
import BalanceModule from '@/lib/components/BalanceModule';
import Navbar from '@/lib/components/Navbar';
import { TransactionsModule } from '@/lib/components/TransactionsModule';
import WithdrawModule from '@/lib/components/WithdrawModule';
import SwapModule from '@/lib/components/SwapModule';
import { useState } from 'react';

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
