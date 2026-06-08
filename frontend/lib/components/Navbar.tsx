'use client';

import Link from 'next/link';
import { decodeToken } from 'react-jwt';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { CaretDownIcon, SignOutIcon } from '@phosphor-icons/react';
import { Anchor, Avatar, Group, Menu, Text, Burger, Collapse, Stack, Box } from '@mantine/core';

import { logout } from '../api/wallet';
import { getFirstAndLastName, getInitials } from '../methods';
import { clearAccessToken, getAccessToken } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('Usuário');
  const [opened, { toggle, close }] = useDisclosure(false);

  const initials = getInitials(username);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      const decodedToken = decodeToken<{ name: string }>(accessToken);

      if (decodedToken) {
        setUsername(decodedToken.name);
      }
    }
  }, []);

  const doLogout = async () => {
    try {
      await logout();
      clearAccessToken();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box mb="md">
      <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Anchor
          fw={500}
          variant="gradient"
          size="lg"
          gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
          href="/"
        >
          Carteira Nexus
        </Anchor>
        <Group gap="sm" visibleFrom="sm">
          <Group justify="space-around" mr="sm">
            <Anchor component={Link} href="/wallet" c="black">
              Carteira
            </Anchor>
            <Anchor component={Link} href="/transactions" c="black">
              Transações
            </Anchor>
          </Group>
          <Menu>
            <Menu.Target>
              <Group gap={8} style={{ cursor: 'pointer' }}>
                <Avatar color="teal" radius="xl">
                  {initials}
                </Avatar>
                <Text>{getFirstAndLastName(username)}</Text>
                <CaretDownIcon size={16} />
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={doLogout} leftSection={<SignOutIcon size={20} />} color="red">
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      </Group>

      <Collapse expanded={opened} hiddenFrom="sm">
        <Stack px="md" pb="md" pt="sm" style={{ borderBottom: '1px solid #e0e0e0' }}>
          <Anchor component={Link} href="/wallet" onClick={close} c="black">
            Carteira
          </Anchor>
          <Anchor component={Link} href="/transactions" onClick={close} c="black">
            Transações
          </Anchor>

          <Group justify="space-between" mt="sm">
            <Group gap={8}>
              <Avatar color="teal" radius="xl">
                {initials}
              </Avatar>
              <Text fw={500}>{getFirstAndLastName(username)}</Text>
            </Group>
            <SignOutIcon size={24} color="red" onClick={doLogout} style={{ cursor: 'pointer' }} />
          </Group>
        </Stack>
      </Collapse>
    </Box>
  );
}
