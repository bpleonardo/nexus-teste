import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { ArrowsLeftRightIcon } from '@phosphor-icons/react';

import { executeSwap, getQuote, QuoteResponse } from '../api/wallet';
import { formatCurrency } from '../methods';

interface SwapModuleProps {
  currencyOptions: { value: string; label: string }[];
  onSuccess?: () => void;
}

export default function SwapModule({ currencyOptions, onSuccess }: SwapModuleProps) {
  const [originToken, setOriginToken] = useState<string | null>('BTC');
  const [destinationToken, setDestinationToken] = useState<string | null>('BRL');

  const [amount, setAmount] = useState('');

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const [loadingSwap, setLoadingSwap] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const swapDirection = () => {
    setOriginToken(destinationToken);
    setDestinationToken(originToken);
    setQuote(null);
    setQuoteError(null);
  };

  useEffect(() => {
    setQuote(null);
    setQuoteError(null);
    if (!originToken || !destinationToken || !amount) {
      return;
    }

    const numericAmount = parseFloat(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    setLoadingQuote(true);

    const timer = setTimeout(async () => {
      try {
        const result = await getQuote(originToken!, destinationToken!, numericAmount);

        if (!result) {
          throw new Error('Failed to get quote');
        }

        setQuote(result);
      } catch (err) {
        console.error(err);
        setQuoteError('Falha ao obter cotação.');
      } finally {
        setLoadingQuote(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [amount, originToken, destinationToken]);

  const doSwap = async () => {
    if (!originToken || !destinationToken || !amount || !quote) {
      return;
    }

    try {
      setLoadingSwap(true);

      await executeSwap(originToken, destinationToken, parseFloat(amount));

      setAmount('');
      setQuote(null);
      onSuccess?.();
    } catch (err) {
      console.error('Swap failed:', err);
      notifications.show({
        color: 'red',
        title: 'Erro',
        message: 'Falha ao realizar o swap. Tente novamente.',
        position: 'bottom-right',
      });
    } finally {
      setLoadingSwap(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={700} size="lg" mb="lg">
        Swap
      </Text>

      <Group align="end" grow mb="md">
        <Select
          label="Token de origem"
          data={currencyOptions}
          value={originToken}
          onChange={setOriginToken}
          searchable
        />

        <ActionIcon size="lg" variant="light" onClick={swapDirection} mb={2}>
          <ArrowsLeftRightIcon size={20} />
        </ActionIcon>

        <Select
          label="Token de destino"
          data={currencyOptions}
          value={destinationToken}
          onChange={setDestinationToken}
          searchable
        />
      </Group>

      <TextInput
        label="Quantia"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        type="number"
      />

      {loadingQuote && (
        <Group justify="center" mt="md">
          <Loader size="sm" />
        </Group>
      )}

      {quote && !loadingQuote && (
        <Card mt="md" p="md" radius="md" bg="gray.0" withBorder>
          <Text fw={600} mb="sm">
            Cotação
          </Text>

          <Stack gap="xs">
            <Group justify="space-between">
              <Text c="dimmed">Você paga</Text>
              <Text fw={500}>{formatCurrency(parseFloat(amount), originToken!)}</Text>
            </Group>

            <Group justify="space-between">
              <Text c="dimmed">Taxa (1,5%)</Text>
              <Text fw={500}>{formatCurrency(quote.tax, destinationToken!)}</Text>
            </Group>

            <Divider />

            <Group justify="space-between">
              <Text fw={700}>Você recebe</Text>
              <Text fw={700} size="lg">
                {formatCurrency(quote.amount, destinationToken!)}
              </Text>
            </Group>
          </Stack>
        </Card>
      )}

      {quoteError && !loadingQuote && (
        <Alert color="red" mt="md" variant="light">
          {quoteError}
        </Alert>
      )}

      <Button
        mt="lg"
        fullWidth
        size="md"
        onClick={doSwap}
        loading={loadingSwap}
        disabled={!quote || loadingQuote}
      >
        Confirmar Swap
      </Button>
    </Card>
  );
}
