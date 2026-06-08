'use client';

import { Anchor, Avatar, Group, Menu, Text } from '@mantine/core';
import { CaretDownIcon, SignOutIcon } from '@phosphor-icons/react';
import { logout } from '../api/wallet';
import { useRouter } from 'next/navigation';
import { clearAccessToken, getAccessToken } from '@/lib/auth';
import { getFirstAndLastName, getInitials } from '../methods';
import { useEffect, useState } from 'react';
import { decodeToken } from 'react-jwt';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('Usuário');

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
    <Group justify="space-between" mb="md" p="md" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <Text
        fw={500}
        variant="gradient"
        size="lg"
        gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
      >
        Carteira Nexus
      </Text>
      <Group gap="sm">
        <Group justify="space-around" mr="sm">
          <Anchor component={Link} href="/wallet">
            Carteira
          </Anchor>
          <Anchor component={Link} href="/transactions">
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
    </Group>
  );
}
