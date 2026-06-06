import {
  Button,
  Group,
  Menu,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import {
  CaretDownIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { logout } from '../api/wallet';
import { useRouter } from 'next/navigation';
import { clearAccessToken } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

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
    <Group justify="space-between" mb="xl" p="md" style={{ borderBottom: '1px solid #e0e0e0' }}>
      <Text fw={500} size="lg">
        Nexus Wallet
      </Text>
      <Group gap="sm">
        <Menu>
          <Menu.Target>
            <Group gap={8} style={{ cursor: 'pointer' }}>
              <UserCircleIcon size={32} />
              <Text>Usuário</Text>
              <CaretDownIcon size={16} />
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={doLogout} leftSection={<SignOutIcon size={20} />} color="red">
              Sair
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button variant="transparent" color="gray" onClick={toggleColorScheme}>
          {computedColorScheme === 'dark' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </Button>
      </Group>
    </Group>
  );
}
