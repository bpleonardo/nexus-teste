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
  Loader,
} from '@mantine/core';
import Link from 'next/link';
import { CaretDownIcon } from '@phosphor-icons/react';
import { useEffect, useState, useCallback } from 'react';

import Transaction from './Transaction';
import { getTransactions, TransactionType } from '../api/wallet';
import { notifications } from '@mantine/notifications';

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
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setError(true);

      if (!isInitialLoad) {
        notifications.show({
          color: 'red',
          title: 'Erro',
          message: 'Falha ao atualizar as transações. Tente recarregar a página.',
          position: 'bottom-right',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [refreshTrigger, loadData]);

  const isInitialLoad = transactions[0] === dummyTransaction;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group
        justify="space-between"
        gap="8"
        mb={expanded ? 'md' : undefined}
        style={{ transition: 'margin-bottom 0.2s ease' }}
      >
        <Group>
          <Text fw={500}>Últimas transações</Text>
          {loading && !isInitialLoad && <Loader size={20} />}
        </Group>
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
              <Skeleton key={`${tx.date}-${idx}`} visible={loading && isInitialLoad}>
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
    </Card>
  );
}
