import { Badge, Group, Text, Box } from '@mantine/core';
import { formatCurrency } from '../methods';
import { TransactionType } from '../api/wallet';

interface TransactionProps {
  transaction: TransactionType;
}

export default function Transaction({ transaction }: TransactionProps) {
  return (
    <Group
      justify="space-between"
      p="sm"
      bg="gray.0"
      style={{ borderRadius: 'var(--mantine-radius-md)' }}
    >
      <Box>
        <Group gap="xs">
          <Badge size="sm" variant="dot">
            {transaction.type}
          </Badge>
          <Text size="sm">
            {transaction.originToken}
            {transaction.destinationToken ? ` → ${transaction.destinationToken}` : ''}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {new Date(transaction.date).toLocaleDateString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Box>
      <Text fw={500} size="sm">
        {formatCurrency(transaction.originAmount, transaction.originToken)}
        {transaction.destinationAmount
          ? ` → ${formatCurrency(transaction.destinationAmount, transaction.destinationToken!)}`
          : ''}
      </Text>
    </Group>
  );
}
