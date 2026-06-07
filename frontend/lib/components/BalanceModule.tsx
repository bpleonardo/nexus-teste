import { ActionIcon, Card, Collapse, Group, Skeleton, Stack, Text } from '@mantine/core';
import { CaretDownIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../methods';
import { getBalance, type Balance } from '../api/wallet';
import { primaryCurrency } from '../constants';

interface BalanceModuleProps {
  currencyOptions: { label: string; value: string }[];
}

export default function BalanceModule({ currencyOptions }: BalanceModuleProps) {
  const [moduleLoading, setModuleLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const balance = await getBalance();
      if (balance) {
        setBalance(balance);
        setModuleLoading(false);
      }
    };

    loadData();
  }, []);

  const totalBalance = balance?.totalInBRL || 0;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Text fw={500} size="lg">
          Saldo
        </Text>
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

      {moduleLoading ? (
        <Skeleton
          mt="0.5ex"
          height="1.8em"
          width="9em"
          mb={expanded ? 'md' : undefined}
          style={{ transition: 'margin-bottom 0.2s ease' }}
        />
      ) : (
        <Text
          size="xl"
          fw={700}
          mb={expanded ? 'md' : undefined}
          style={{ transition: 'margin-bottom 0.2s ease' }}
        >
          {formatCurrency(totalBalance, primaryCurrency)}
        </Text>
      )}

      <Collapse expanded={expanded}>
        <Stack gap="xs">
          {currencyOptions.map((opt) => (
            <Group justify="space-between" key={opt.value}>
              <Text size="sm">{opt.value}</Text>
              {moduleLoading ? (
                <Skeleton mt="0.5ex" height="1em" width="5em" />
              ) : (
                <Text size="sm" fw={500}>
                  {formatCurrency(balance?.[opt.value] || 0, opt.value)}
                </Text>
              )}
            </Group>
          ))}
        </Stack>
      </Collapse>
    </Card>
  );
}
