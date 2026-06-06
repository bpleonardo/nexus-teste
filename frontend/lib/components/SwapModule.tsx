import { Button, Card, Grid, Group, Loader, Select, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { executeSwap } from '../api/wallet';

interface SwapModuleProps {
  currencyOptions: { value: string; label: string }[];
}

export default function SwapModule({ currencyOptions }: SwapModuleProps) {
  const [originToken, setOriginToken] = useState<string | null>('BTC');
  const [destinationToken, setDestinationToken] = useState<string | null>('BRL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const doSwap = async () => {
    if (!originToken || !destinationToken || !amount) return;

    try {
      setLoading(true);
      await executeSwap(originToken, destinationToken, parseFloat(amount));
      setAmount('');
    } catch (error) {
      console.error('Swap failed:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    // <Grid.Col span={{ base: 12, md: 6 }}>
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={500} size="lg" mb="md">
        Swap
      </Text>

      <Group grow mb="md">
        <Select
          label="Token de origem"
          placeholder="Selecione uma token"
          data={currencyOptions}
          value={originToken}
          onChange={setOriginToken}
          searchable
        />
        <Select
          label="Token de destino"
          placeholder="Selecione uma token"
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
        mb="md"
        type="number"
        min="0"
        step="0.00000001"
      />

      {loading && <Loader size="sm" mb="md" />}

      <Button fullWidth onClick={doSwap} loading={loading} disabled={!amount || loading}>
        Swap
      </Button>
    </Card>
    // </Grid.Col>
  );
}
