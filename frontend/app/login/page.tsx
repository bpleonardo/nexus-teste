'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Paper,
  Button,
  Stack,
  Title,
  Alert,
  TextInput,
  PasswordInput,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { login } from '@/lib/auth';
import React, { useEffect } from 'react';
import { InvalidCredentials } from '@/lib/errors';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      router.push('/wallet');
    }
  }, [router]);

  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validate: {
      email: (value) => (/^[^@]+@[^@]+\.[^@]+$/.test(value) ? null : 'Email inválido'),
      password: (value) => {
        return value.length >= 8 ? null : 'A senha deve ter pelo menos 8 caracteres';
      },
    },
    onValuesChange: () => setError(null),
    validateInputOnBlur: true,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await login(values.email, values.password, values.remember);
      router.push('/wallet');
    } catch (err) {
      if (err instanceof InvalidCredentials) {
        setError('Email ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
    }
  });

  useEffect(() => {
    setError(params.get('expired') ? 'Sua sessão expirou. Por favor, faça login novamente.' : null);
  }, [params]);

  return (
    <Container size="xs" py="xl">
      <Paper shadow="md" p="lg" radius="md" withBorder>
        <Title order={1} ta="center" mb="lg">
          Entrar
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert
                withCloseButton
                closeButtonLabel="Fechar"
                variant="outline"
                color="red"
                radius="lg"
                title="Erro"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
            <TextInput
              {...form.getInputProps('email')}
              label="Email"
              type="email"
              placeholder="seunome@exemplo.com"
              required
            />
            <PasswordInput
              {...form.getInputProps('password')}
              label="Senha"
              type="password"
              placeholder="••••••••"
              required
            />
            <Checkbox
              {...form.getInputProps('remember', { type: 'checkbox' })}
              label="Lembrar de mim"
              variant="outline"
            />
            <Button type="submit" fullWidth loading={form.submitting}>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
