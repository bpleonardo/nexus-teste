import {
  ActionIcon,
  Card,
  Collapse,
  Group,
  Skeleton,
  Stack,
  Text,
  RollingNumber,
} from '@mantine/core';
import { CaretDownIcon } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../methods';
import { getBalance, type Balance } from '../api/wallet';
import { primaryCurrency, CURRENCY_SYMBOLS } from '../constants';

interface BalanceModuleProps {
  currencyOptions: { label: string; value: string }[];
  refreshTrigger?: number;
}

export default function BalanceModule({ currencyOptions, refreshTrigger = 0 }: BalanceModuleProps) {
  const [expanded, setExpanded] = useState(false);
  const [balance, setBalance] = useState<Balance | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const balance = await getBalance();
      if (balance) {
        setBalance(balance);
      }
    };

    loadData();
  }, [refreshTrigger]);

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

      {!balance ? (
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
          component="div"
        >
          <RollingNumber
            value={totalBalance}
            prefix={
              CURRENCY_SYMBOLS[primaryCurrency]
                ? `${CURRENCY_SYMBOLS[primaryCurrency]} `
                : `${primaryCurrency} `
            }
            decimalSeparator={primaryCurrency === 'BRL' ? ',' : '.'}
            thousandSeparator={primaryCurrency === 'BRL' ? '.' : false}
            decimalScale={primaryCurrency === 'BRL' ? 2 : 8}
            fixedDecimalScale={primaryCurrency === 'BRL'}
          />
        </Text>
      )}

      <Collapse expanded={expanded}>
        <Stack gap="xs">
          {currencyOptions.map((opt) => (
            <Group justify="space-between" key={opt.value}>
              <Text size="sm">{opt.value}</Text>
              {!balance ? (
                <Skeleton mt="0.5ex" height="1em" width="5em" />
              ) : (
                <Text size="sm" fw={500} component="div">
                  <RollingNumber
                    value={balance[opt.value] || 0}
                    prefix={
                      CURRENCY_SYMBOLS[opt.value]
                        ? `${CURRENCY_SYMBOLS[opt.value]} `
                        : `${opt.value} `
                    }
                    decimalSeparator={opt.value === 'BRL' ? ',' : '.'}
                    thousandSeparator={opt.value === 'BRL' ? '.' : false}
                    decimalScale={opt.value === 'BRL' ? 2 : 8}
                    fixedDecimalScale={opt.value === 'BRL'}
                  />
                </Text>
              )}
            </Group>
          ))}
        </Stack>
      </Collapse>
    </Card>
  );
}
