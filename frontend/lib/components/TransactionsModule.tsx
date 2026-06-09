import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';
import {
  ActionIcon,
  Anchor,
  Card,
  Collapse,
  Group,
  Skeleton,
  Stack,
  Text,
  Button,
  Overlay,
  Notification,
} from '@mantine/core';

import Transaction from './Transaction';
import { getTransactions, TransactionType } from '../api/wallet';

const dummyTransaction: TransactionType = {
  date: new Date().toDateString(),
  type: 'DEPOSIT',
  originAmount: 0,
  originToken: 'BRL',
  tax: 0,
  destinationToken: null,
  destinationAmount: null,
};

interface TransactionsModuleProps {
  refreshTrigger?: number;
}

export default function TransactionsModule({ refreshTrigger = 0 }: TransactionsModuleProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionType[]>(
    Array(5).fill(dummyTransaction),
  );
  const [expanded, setExpanded] = useState<boolean>(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      setTransactions(await getTransactions(5));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [refreshTrigger, loadData]);

  const isInitialLoad = transactions[0] === dummyTransaction;

  return (
    <>
      <Button onClick={() => loadData()}>a</Button>
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
                <Skeleton key={`${tx.date}-${idx}`} visible={loading || tx === dummyTransaction}>
                  <Transaction transaction={tx} />
                </Skeleton>
              ))
            )}
          </Stack>
        </Collapse>

        {error && isInitialLoad && (
          <Overlay color="#fa5252" backgroundOpacity={0.35} blur={3} zIndex={10} center>
            <Stack align="center" gap="xs">
              <Text c="dark.9" fw={600}>
                Falha ao carregar transações.
              </Text>
              <Button onClick={loadData} size="xs" color="red">
                Tente novamente
              </Button>
            </Stack>
          </Overlay>
        )}

        {error && !isInitialLoad && (
          <Notification color="red" mt="md" onClose={() => setError(false)} title="Erro">
            Falha ao carregar transações.
            <Anchor component="button" size="sm" onClick={loadData}>
              Tente novamente
            </Anchor>
          </Notification>
        )}
      </Card>
    </>
  );
}
