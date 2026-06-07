'use client';

import {
  Card,
  Text,
  Stack,
  Skeleton,
  Box,
  Group,
  Select,
  Affix,
  Transition,
  Button,
} from '@mantine/core';
import { useIntersection, useWindowScroll } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import Navbar from '@/lib/components/Navbar';
import Transaction from '@/lib/components/Transaction';
import { getPaginatedTransactions, TransactionType } from '@/lib/api/wallet';
import { ArrowUpIcon } from '@phosphor-icons/react';

const dummyTransaction: TransactionType = {
  date: new Date().toDateString(),
  type: 'DEPOSIT',
  originAmount: 0,
  originToken: 'BRL',
  tax: 0,
  destinationToken: null,
  destinationAmount: null,
};

const TRANSACTIONS_PER_FETCH = 7;

export default function TransactionsPage() {
  const dummyTransactionsList =
    Array<TransactionType>(TRANSACTIONS_PER_FETCH).fill(dummyTransaction);

  const [transactions, setTransactions] = useState(dummyTransactionsList);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [sortOrder, setSortOrder] = useState('desc');

  const [cursor, setCursor] = useState<string | null>(null);

  const [scroll, scrollTo] = useWindowScroll();

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5,
  });

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);

      try {
        const data = await getPaginatedTransactions(TRANSACTIONS_PER_FETCH, null, sortOrder);

        if (data) {
          setTransactions(data.transactions);
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [sortOrder]);

  useEffect(() => {
    const loadMore = async () => {
      if (!cursor) return;

      setLoadingMore(true);

      try {
        const data = await getPaginatedTransactions(TRANSACTIONS_PER_FETCH, cursor, sortOrder);

        if (data) {
          setTransactions((prev) => [...prev, ...data.transactions]);
          setCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch (error) {
        console.error('Failed to load more transactions:', error);
      } finally {
        setLoadingMore(false);
      }
    };

    if (entry?.isIntersecting && hasMore && !loadingMore && !pageLoading) {
      loadMore();
    }
  }, [entry?.isIntersecting, hasMore, loadingMore, pageLoading, cursor, sortOrder]);

  return (
    <>
      <Navbar />

      <Card shadow="sm" p="lg" m="lg" withBorder>
        <Group justify="space-between" align="center" mb="md">
          <Text fw={500}>Todas as transações</Text>

          <Group gap="xs">
            <Text size="sm">Ordenação:</Text>

            <Select
              value={sortOrder}
              onChange={(value) => setSortOrder(value ?? 'desc')}
              data={[
                { value: 'desc', label: 'Mais novos' },
                { value: 'asc', label: 'Mais antigos' },
              ]}
              w={160}
            />
          </Group>
        </Group>

        <Stack gap="md">
          {transactions.length === 0 ? (
            <Text c="dimmed" ta="center" size="sm">
              Sem transações
            </Text>
          ) : (
            transactions.map((tx, idx) => (
              <Skeleton key={`${tx.date}-${idx}`} visible={pageLoading}>
                <Transaction transaction={tx} />
              </Skeleton>
            ))
          )}

          {loadingMore &&
            dummyTransactionsList.map((_, idx) => (
              <Skeleton key={idx} visible>
                <Transaction transaction={dummyTransaction} />
              </Skeleton>
            ))}

          {hasMore && !pageLoading && <Box ref={ref} h={1} />}
        </Stack>
      </Card>

      <Affix position={{ bottom: 20, left: '50%' }} style={{ transform: 'translateX(-50%)' }}>
        <Transition transition="slide-up" mounted={scroll.y > 0}>
          {(transitionStyles) => (
            <Button
              leftSection={<ArrowUpIcon size={16} />}
              style={transitionStyles}
              onClick={() => scrollTo({ y: 0 })}
            >
              Voltar ao topo
            </Button>
          )}
        </Transition>
      </Affix>
    </>
  );
}
