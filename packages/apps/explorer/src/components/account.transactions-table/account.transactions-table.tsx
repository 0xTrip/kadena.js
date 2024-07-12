import type {
  AccountTransactionsQuery,
  Transaction,
} from '@/__generated__/sdk';
import { useAccountTransactionsQuery } from '@/__generated__/sdk';
import { usePagination } from '@/hooks/usePagination';
import { graphqlIdFor } from '@/utils/graphqlIdFor';
import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import CompactTable from '../compact-table/compact-table';
import { FormatLink } from '../compact-table/utils/format-link';
import { FormatStatus } from '../compact-table/utils/format-status';
import { loadingData } from './loading-data-account-transactionsquery';

const AccountTransactionsTable: FC<{ accountName: string }> = ({
  accountName,
}) => {
  const id = graphqlIdFor('FungibleAccount', `["coin", "${accountName}"]`);
  const [innerData, setInnerData] =
    useState<AccountTransactionsQuery>(loadingData);
  const [isLoading, setIsLoading] = useState(true);

  const { variables, handlePageChange, pageSize } = usePagination({
    id,
  });

  const { data, loading } = useAccountTransactionsQuery({
    variables,
    skip: !id,
  });

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }

    if (data) {
      setTimeout(() => {
        setIsLoading(false);

        setInnerData(data);
      }, 200);
    }
  }, [loading, data]);

  if (innerData.node?.__typename !== 'FungibleAccount') return null;

  return (
    <CompactTable
      setPage={handlePageChange}
      pageSize={pageSize}
      pageInfo={innerData.node!.transactions.pageInfo}
      totalCount={innerData.node!.transactions.totalCount}
      isLoading={isLoading}
      label="Keys table"
      fields={[
        {
          label: 'Status',
          key: 'result.goodResult',
          variant: 'code',
          width: '10%',
          render: FormatStatus(),
        },
        {
          label: 'Sender',
          key: 'cmd.meta.sender',
          variant: 'code',
          width: '25%',
          render: FormatLink({ appendUrl: '/account' }),
        },
        {
          label: 'RequestKey',
          key: 'hash',
          variant: 'code',
          width: '25%',
          render: FormatLink({ appendUrl: '/transaction' }),
        },
        {
          label: 'Code Preview',
          key: 'cmd.payload.code',
          variant: 'code',
          width: '40%',
        },
      ]}
      data={innerData.node!.transactions.edges.map(
        (edge) => edge.node as Transaction,
      )}
    />
  );
};

export default AccountTransactionsTable;