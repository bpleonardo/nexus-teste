import {
  Anchor,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import { getTransactions, Transaction } from '../api/wallet';
import { formatCurrency } from '../methods';
import { useEffect, useState } from 'react';

export function TransactionsModule() {
  const [moduleLoading, setModuleLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Box pos="relative">
        <LoadingOverlay visible={moduleLoading} zIndex={1000} overlayProps={{ blur: 2 }} />
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" gap="8" mb="md">
            <Text fw={500}>Últimas transações</Text>
            <Anchor href="/transactions" c="dark">
              Ver todas →
            </Anchor>
          </Group>

          <Stack gap="md">
            {transactions.length === 0 ? (
              <Text c="dimmed" ta="center" size="sm">
                Sem transações
              </Text>
            ) : (
              transactions.map((tx, idx) => (
                <Group
                  justify="space-between"
                  key={idx}
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
              ))
            )}
          </Stack>
        </Card>
      </Box>
    </Grid.Col>
  );
}
