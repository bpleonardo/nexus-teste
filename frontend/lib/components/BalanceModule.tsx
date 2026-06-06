import { ActionIcon, Card, Collapse, Grid, Group, Stack, Text } from '@mantine/core';
import { CaretDownIcon } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { formatCurrency } from '../methods';
import type { Balance } from '../api/wallet';
import { primaryCurrency, KNOWN_CURRENCIES } from '../constants';

interface BalanceModuleProps {
  balance: Balance | null;
  currencyOptions: { label: string; value: string }[];
}

export default function BalanceModule({ balance, currencyOptions }: BalanceModuleProps) {
  const [balanceExpanded, setBalanceExpanded] = useState(false);

  const totalBalance = balance?.totalInBRL || 0;

  return (
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={500} size="lg">
            Saldo
          </Text>
          <ActionIcon variant="subtle" onClick={() => setBalanceExpanded(!balanceExpanded)}>
            <CaretDownIcon
              size={20}
              style={{
                transform: balanceExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </ActionIcon>
        </Group>

        <Text size="xl" fw={700} mb="md">
          {formatCurrency(totalBalance, primaryCurrency)}
        </Text>

        <Collapse expanded={balanceExpanded}>
          <Stack gap="xs">
            {currencyOptions.map((opt) => (
              <Group justify="space-between" key={opt.value}>
                <Text size="sm">{opt.value}</Text>
                <Text size="sm" fw={500}>
                  {formatCurrency(balance?.[opt.value] || 0, opt.value)}
                </Text>
              </Group>
            ))}
          </Stack>
        </Collapse>
      </Card>
    </Grid.Col>
  );
}
