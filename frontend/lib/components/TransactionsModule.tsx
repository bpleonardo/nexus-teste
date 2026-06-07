import {
  ActionIcon,
  Anchor,
  Badge,
  Card,
  Collapse,
  Group,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { getTransactions, Transaction } from '../api/wallet';
import { formatCurrency } from '../methods';
import { useEffect, useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react';

const dummyTransaction: Transaction = {
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
  const [transactions, setTransactions] = useState<Transaction[]>(Array(5).fill(dummyTransaction));
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setTransactions(await getTransactions(5));
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      } finally {
        setModuleLoading(false);
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
          <Anchor href="/transactions" c="dark">
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
              <Skeleton key={idx} visible={moduleLoading}>
                <Group
                  justify="space-between"
                  p="sm"
                  bg="gray.0"
                  style={{ borderRadius: 'var(--mantine-radius-md)' }}
                >
                  <div>
                    <Group gap="xs">
                      <Badge size="sm" variant="dot">
                        {tx.type}
                      </Badge>
                      <Text size="sm">
                        {tx.originToken}
                        {tx.destinationToken ? ` → ${tx.destinationToken}` : ''}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {new Date(tx.date).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </div>
                  <Text fw={500} size="sm">
                    {formatCurrency(tx.originAmount, tx.originToken)}
                    {tx.destinationAmount
                      ? ` → ${formatCurrency(tx.destinationAmount, tx.destinationToken!)}`
                      : ''}
                  </Text>
                </Group>
              </Skeleton>
            ))
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}
