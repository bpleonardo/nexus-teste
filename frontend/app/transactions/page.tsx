'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUpIcon, SortAscendingIcon } from '@phosphor-icons/react';
import { useIntersection, useToggle, useWindowScroll } from '@mantine/hooks';
import { Card, Text, Stack, Skeleton, Box, Group, Affix, Transition, Button } from '@mantine/core';

import Navbar from '@/lib/components/Navbar';
import Transaction from '@/lib/components/Transaction';
import { getPaginatedTransactions, TransactionType } from '@/lib/api/wallet';

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
  const [pageLoadingError, setPageLoadingError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);

  const [sortOrder, toggleSortOrder] = useToggle([
    { key: 'desc', label: 'Mais antigos' },
    { key: 'asc', label: 'Mais novos' },
  ]);

  const [cursor, setCursor] = useState<string | null>(null);

  const [scroll, scrollTo] = useWindowScroll();

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 0.5,
  });

  const loadData = useCallback(async () => {
    setPageLoading(true);
    setPageLoadingError(false);
    setLoadMoreError(false);

    try {
      const data = await getPaginatedTransactions(TRANSACTIONS_PER_FETCH, null, sortOrder.key);

      if (data) {
        setTransactions(data.transactions);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } else {
        setPageLoadingError(true);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setPageLoadingError(true);
    } finally {
      setPageLoading(false);
    }
  }, [sortOrder.key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMore = useCallback(async () => {
    if (!cursor) return;

    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const data = await getPaginatedTransactions(TRANSACTIONS_PER_FETCH, cursor, sortOrder.key);

      if (data) {
        setTransactions((prev) => [...prev, ...data.transactions]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
      } else {
        setLoadMoreError(true);
      }
    } catch (error) {
      console.error('Failed to load more transactions:', error);
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, sortOrder.key]);

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loadingMore && !pageLoading && !pageLoadingError && !loadMoreError) {
      loadMore();
    }
  }, [entry?.isIntersecting, hasMore, loadingMore, pageLoading, pageLoadingError, loadMoreError, loadMore]);

  return (
    <>
      <Navbar />

      <Card shadow="sm" p="lg" m="lg" withBorder>
        <Group justify="space-between" align="center" mb="md">
          <Text fw={500}>Todas as transações</Text>

          <Group gap="xs">
            <Text size="sm">Ordenação:</Text>

            <Button
              rightSection={
                <SortAscendingIcon
                  size={20}
                  style={{
                    transform: sortOrder.key === 'desc' ? 'rotate(180deg) scaleX(-1)' : '',
                    transition: 'transform 0.2s',
                  }}
                ></SortAscendingIcon>
              }
              variant="default"
              style={{ transition: 'width 0.2s' }}
              onClick={() => toggleSortOrder()}
            >
              {sortOrder.label}
            </Button>
          </Group>
        </Group>

        <Stack gap="md">
          {pageLoadingError ? (
            <Stack align="center" p="xl">
              <Text c="red" fw={500}>
                Falha ao carregar transações.
              </Text>
              <Button onClick={loadData} variant="outline" color="red">
                Tente novamente
              </Button>
            </Stack>
          ) : transactions.length === 0 && !pageLoading ? (
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

          {loadMoreError && (
            <Stack align="center" p="md">
              <Text c="red" fw={500}>
                Falha ao carregar mais transações.
              </Text>
              <Button onClick={loadMore} variant="outline" color="red">
                Tente novamente
              </Button>
            </Stack>
          )}

          {hasMore && !pageLoading && !pageLoadingError && !loadMoreError && <Box ref={ref} h={1} />}
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
