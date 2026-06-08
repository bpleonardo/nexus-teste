import { useState } from 'react';
import { Button, Card, Select, Text, TextInput } from '@mantine/core';

import { withdraw } from '../api/wallet';

interface WithdrawModuleProps {
  currencyOptions: { value: string; label: string }[];
  onSuccess?: () => void;
}

export default function WithdrawModule({ currencyOptions, onSuccess }: WithdrawModuleProps) {
  const [token, setToken] = useState<string | null>('BRL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const doWithdraw = async () => {
    if (!token || !amount) return;

    try {
      setLoading(true);
      await withdraw(token, parseFloat(amount));
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text fw={500} size="lg" mb="md">
        Saque
      </Text>

      <Select
        label="Token"
        placeholder="Selecionar token"
        data={currencyOptions}
        value={token}
        onChange={setToken}
        mb="md"
        searchable
      />

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

      <Button
        fullWidth
        onClick={doWithdraw}
        loading={loading}
        disabled={!token || !amount || loading}
      >
        Sacar
      </Button>
    </Card>
  );
}
