'use client';

import Link from 'next/link';
import { ArrowRightIcon } from '@phosphor-icons/react';
import { Container, Text, Button, Group, Box } from '@mantine/core';

export default function Home() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container size="md" style={{ textAlign: 'center' }}>
        <Text
          component="h1"
          fw={900}
          variant="gradient"
          gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
          style={{
            fontSize: 'clamp(3rem, 5vw, 5rem)',
            marginBottom: '1rem',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: 0,
            paddingBottom: '1rem',
          }}
        >
          Bem-vindo a Carteira Nexus
        </Text>

        <Text
          c="dimmed"
          size="xl"
          style={{
            maxWidth: 600,
            margin: '0 auto',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}
        >
          Experimente a carteira de criptomoedas da Nexus. A sua melhor carteira digital!
        </Text>

        <Group justify="center">
          <Button
            component={Link}
            href="/login"
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
            rightSection={<ArrowRightIcon weight="bold" />}
          >
            Começar
          </Button>
        </Group>
      </Container>
    </Box>
  );
}
