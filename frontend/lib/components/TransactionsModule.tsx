import { ActionIcon, Anchor, Card, Collapse, Group, Skeleton, Stack, Text } from '@mantine/core';
import { getTransactions, TransactionType } from '../api/wallet';
import { useEffect, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import Transaction from './Transaction';
import Link from 'next/link';

const dummyTransaction: TransactionType = {
  date: new Date().toDateString(),
  type: 'DEPOSIT',
  originAmount: 0,
  originToken: 'BRL',
  tax: 0,
  destinationToken: null,
  destinationAmount: null,
};

export function TransactionsModule() {
  const [moduleLoading, setModuleLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>(
    Array(5).fill(dummyTransaction),
  );
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setTransactions(await getTransactions(5));
        setModuleLoading(false);
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group
        justify="space-between"
        gap="8"
        mb={expanded ? 'md' : undefined}
        style={{ transition: 'margin-bottom 0.2s ease' }}
      >
        <Text fw={500}>Últimas transações</Text>
        <Group>
          <Anchor component={Link} href="/transactions" c="dark">
            Ver todas →
          </Anchor>
          <ActionIcon variant="subtle" onClick={() => setExpanded(!expanded)}>
            <CaretDownIcon
              size={20}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse expanded={expanded}>
        <Stack gap="md">
          {transactions.length === 0 ? (
            <Text c="dimmed" ta="center" size="sm">
              Sem transações
            </Text>
          ) : (
            transactions.map((tx, idx) => (
              <Skeleton key={`${tx.date}-${idx}`} visible={moduleLoading}>
                <Transaction transaction={tx} />
              </Skeleton>
            ))
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}
