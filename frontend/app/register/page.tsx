'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Button,
  Title,
  TextInput,
  MaskInput,
  Grid,
  Group,
  Progress,
  Stepper,
  PasswordInput,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState, useRef } from 'react';
import { validateCPF } from '@/lib/validators';
import zxcvbn from 'zxcvbn';
import { UserCircleIcon, MapPinIcon, IdentificationCardIcon } from '@phosphor-icons/react';
import { register } from '@/lib/auth';
import { UserAlreadyExists } from '@/lib/errors';

function getStrengthColor(strength: number) {
  switch (true) {
    case strength < 1:
      return 'red';
    case strength < 2:
      return 'orange';
    case strength < 3:
      return 'yellow';
    case strength < 4:
      return 'blue';
    default:
      return 'green';
  }
}

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      router.push('/wallet');
    }
  }, [router]);

  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const nameRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active === 0) nameRef.current?.focus();
    if (active === 1) streetRef.current?.focus();
    if (active === 2) emailRef.current?.focus();
  }, [active]);

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return { score: 0 };
    }
    return zxcvbn(value, [
      form.values.name,
      form.values.street,
      form.values.city,
      form.values.email,
      form.values.state,
    ]);
  };

  const nextStep = async () => {
    const result = form.validate();
    if (!result.hasErrors) {
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const form = useForm({
    initialValues: {
      name: '',
      cpf: '',
      phone: '',
      street: '',
      number: '',
      city: '',
      zip: '',
      email: '',
      password: '',
      state: '',
      confirmPassword: '',
    },
    validate: (values): Record<string, string | null> => {
      if (active === 0) {
        return {
          name: values.name.trim().length >= 3 ? null : 'O nome deve ter pelo menos 3 caracteres.',
          cpf: validateCPF(values.cpf) ? null : 'CPF inválido.',
          phone: values.phone.replace(/\D/g, '').length === 11 ? null : 'Telefone inválido.',
        };
      }
      if (active === 1) {
        return {
          street:
            values.street.trim().length >= 3
              ? null
              : 'Logradouro deve ter pelo menos 3 caracteres.',
          number: values.number.trim().length >= 1 ? null : 'Número é obrigatório.',
          city: values.city.trim().length >= 3 ? null : 'Cidade deve ter pelo menos 3 caracteres.',
          state:
            values.state.trim().length >= 2 ? null : 'Estado deve ter pelo menos 2 caracteres.',
          zip: values.zip.replace(/\D/g, '').length === 8 ? null : 'CEP inválido.',
        };
      }
      if (active === 2) {
        let passwordError: string | null = null;
        if (values.password.length < 8) {
          passwordError = 'A senha deve ter pelo menos 8 caracteres.';
        } else {
          const result = validatePassword(values.password);
          if (result.score < 3) {
            passwordError = 'A senha é muito fraca.';
          }
        }
        return {
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? null : 'Email inválido.',
          password: passwordError,
          confirmPassword:
            form.values.confirmPassword !== values.password ? 'As senhas não coincidem.' : null,
        };
      }
      return {};
    },
    onValuesChange: () => {
      setError(null);
    },
    clearInputErrorOnChange: true,
    validateInputOnBlur: true,
  });

  const strength = validatePassword(form.values.password).score;
  const color = getStrengthColor(strength);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await register({
        name: values.name,
        cpf: values.cpf,
        phone: values.phone,
        street: values.street,
        number: values.number,
        city: values.city,
        state: values.state,
        zip: values.zip,
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      if (err instanceof UserAlreadyExists) {
        setError('Um usuário com este email, CPF ou telefone já existe.');
        setActive(0);
        return;
      }
      setError('Ocorreu um erro ao tentar registrar. Tente novamente.');
      setActive(0);
    }
  });

  return (
    <Container p="lg">
      <Paper shadow="md" p="lg" radius="md" withBorder>
        <Title order={1} ta="center" mb="lg">
          Registrar-se
        </Title>

        {error && (
          <Alert
            withCloseButton
            closeButtonLabel="Fechar"
            variant="outline"
            color="red"
            radius="lg"
            title="Erro"
            onClose={() => setError(null)}
            mb="lg"
          >
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Stepper active={active}>
            <Stepper.Step
              label="Informações pessoais"
              description="Diga-nos quem é você"
              icon={<UserCircleIcon size={22} />}
            >
              <TextInput
                ref={nameRef}
                {...form.getInputProps('name')}
                label="Nome completo"
                placeholder="Digite seu nome completo"
                required
              />
              <MaskInput
                label="CPF"
                placeholder="000.000.000-00"
                mask="999.999.999-99"
                required
                onChangeRaw={(value) => form.setFieldValue('cpf', value)}
                onBlur={() => form.validateField('cpf')}
                error={form.errors.cpf}
                mt="md"
              />
              <MaskInput
                label="Telefone"
                placeholder="(00) 00000-0000"
                mask="(99) 99999-9999"
                required
                onChangeRaw={(value) => form.setFieldValue('phone', value)}
                onBlur={() => form.validateField('phone')}
                error={form.errors.phone}
                mt="md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    nextStep();
                  }
                }}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Localização"
              description="Diga-nos onde você mora"
              icon={<MapPinIcon size={22} />}
            >
              <Grid>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <TextInput
                    ref={streetRef}
                    {...form.getInputProps('street')}
                    label="Logradouro"
                    placeholder="Digite seu logradouro"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    {...form.getInputProps('number')}
                    label="Número"
                    placeholder="Número"
                    required
                  />
                </Grid.Col>
              </Grid>
              <TextInput
                {...form.getInputProps('city')}
                label="Cidade"
                placeholder="Digite sua cidade"
                required
                mt="md"
              />
              <TextInput
                {...form.getInputProps('state')}
                label="Estado"
                placeholder="Digite seu estado"
                required
                mt="md"
              />
              <MaskInput
                label="CEP"
                placeholder="00000-000"
                mask="99999-999"
                required
                onChangeRaw={(value) => form.setFieldValue('zip', value)}
                onBlur={() => form.validateField('zip')}
                error={form.errors.zip}
                mt="md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    nextStep();
                  }
                }}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Dados de acesso"
              description="Crie suas credenciais de acesso"
              icon={<IdentificationCardIcon size={22} />}
            >
              <TextInput
                ref={emailRef}
                {...form.getInputProps('email')}
                label="Email"
                type="email"
                placeholder="nome@empresa.com"
                required
              />
              <PasswordInput
                {...form.getInputProps('password')}
                label="Senha"
                type="password"
                placeholder="••••••••"
                required
                mt="md"
              />

              <Group grow gap={5} mt="sm">
                <Progress
                  size="xs"
                  color={color}
                  value={strength < 1 ? 0 : 100}
                  transitionDuration={0}
                />
                <Progress
                  size="xs"
                  color={color}
                  transitionDuration={0}
                  value={strength < 2 ? 0 : 100}
                />
                <Progress
                  size="xs"
                  color={color}
                  transitionDuration={0}
                  value={strength < 3 ? 0 : 100}
                />
                <Progress
                  size="xs"
                  color={color}
                  transitionDuration={0}
                  value={strength < 4 ? 0 : 100}
                />
              </Group>

              <TextInput
                {...form.getInputProps('confirmPassword')}
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                required
                mt="md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    form.onSubmit(async (values) => {
                      await handleSubmit({ preventDefault: () => {} } as any);
                    })(new Event('submit') as any);
                  }
                }}
              />
            </Stepper.Step>
          </Stepper>
          <Group justify="flex-end" mt="xl">
            {active !== 0 && (
              <Button variant="default" onClick={prevStep}>
                Voltar
              </Button>
            )}
            {active !== 2 && <Button onClick={nextStep}>Próximo</Button>}
            {active === 2 && (
              <Button
                type="submit"
                disabled={!!Object.keys(form.errors).length || form.values.password.length === 0}
                loading={form.submitting}
              >
                Registrar
              </Button>
            )}
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
