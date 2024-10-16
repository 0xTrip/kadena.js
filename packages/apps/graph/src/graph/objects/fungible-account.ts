import { prismaClient } from '@db/prisma-client';
import { Prisma } from '@prisma/client';
import { getFungibleChainAccount } from '@services/account-service';
import {
  COMPLEXITY,
  getDefaultConnectionComplexity,
} from '@services/complexity';
import { normalizeError } from '@utils/errors';
import { networkData } from '@utils/network';
import { builder } from '../builder';
import { fungibleAccountDetailsLoader } from '../data-loaders/fungible-account-details';

import type {
  IFungibleAccount,
  IFungibleChainAccount,
} from '../types/graphql-types';
import {
  FungibleAccountName,
  FungibleChainAccountName,
} from '../types/graphql-types';

const keysToCamel = <T extends Record<string, unknown>>(obj: T) => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key.replace(/_(\w)/g, (m, p1) => p1.toUpperCase())] = obj[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );
};
interface ITransferQueryConditions {
  select?: Record<string, boolean>;
  take: number;
  skip: number;
  cursor?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    blockHash_chainId_orderIndex_moduleHash_requestKey?: {
      blockHash: string;
      chainId: number | bigint;
      orderIndex: number | bigint;
      moduleHash: string;
      requestKey: string;
    };
  };
}

const getTransfers = (
  accountName: string,
  fungibleName: string,
  condition?: ITransferQueryConditions,
) => {
  // The query with the pagination cursor is composed separately
  // as Prisma rightfully does not allow dynamic statements in sql queries
  if (!condition?.cursor) {
    return prismaClient.$queryRaw`
SELECT "res0" AS "block_hash",
"res1" AS "request_key",
"res2" AS "chain_id",
"res3" AS "height",
"res4" AS "order_index",
"res5" AS "module_name",
"res6" AS "module_hash",
"res7" AS "sender_account",
"res8" AS "receiver_account",
"res9" AS "amount"
FROM (
SELECT "res0" AS "res0", "t0"."res1" AS "res1", "t0"."res2" AS "res2", "t0"."res3" AS "res3", "t0"."res4" AS "res4", "t0"."res5" AS "res5", "t0"."res6" AS "res6", "t0"."res7" AS "res7", "t0"."res8" AS "res8", "t0"."res9" AS "res9", "t1"."creationtime" AS "res10"
FROM (
  (
    SELECT "t0"."res0" AS "res0", "t0"."res1" AS "res1", "t0"."res2" AS "res2", "t0"."res3" AS "res3", "t0"."res4" AS "res4", "t0"."res5" AS "res5", "t0"."res6" AS "res6", "t0"."res7" AS "res7", "t0"."res8" AS "res8", "t0"."res9" AS "res9"
    FROM (
      SELECT "t0"."block" AS "res0", "t0"."requestkey" AS "res1", "t0"."chainid" AS "res2", "t0"."height" AS "res3", "t0"."idx" AS "res4", "t0"."modulename" AS "res5", "t0"."modulehash" AS "res6", "t0"."from_acct" AS "res7", "t0"."to_acct" AS "res8", "t0"."amount" AS "res9"
      FROM "transfers" AS "t0"
      WHERE ("t0"."from_acct") = (${accountName})
      ORDER BY "t0"."height" DESC, "t0"."requestkey" DESC, "t0"."idx" ASC
    ) AS "t0"
  )
  UNION ALL
  (
    SELECT "t0"."res0" AS "res0", "t0"."res1" AS "res1", "t0"."res2" AS "res2", "t0"."res3" AS "res3", "t0"."res4" AS "res4", "t0"."res5" AS "res5", "t0"."res6" AS "res6", "t0"."res7" AS "res7", "t0"."res8" AS "res8", "t0"."res9" AS "res9"
    FROM (
      SELECT "t0"."block" AS "res0", "t0"."requestkey" AS "res1", "t0"."chainid" AS "res2", "t0"."height" AS "res3", "t0"."idx" AS "res4", "t0"."modulename" AS "res5", "t0"."modulehash" AS "res6", "t0"."from_acct" AS "res7", "t0"."to_acct" AS "res8", "t0"."amount" AS "res9"
      FROM "transfers" AS "t0"
      WHERE ("t0"."to_acct") = (${accountName})
      ORDER BY "t0"."height" DESC, "t0"."requestkey" DESC, "t0"."idx" ASC
    ) AS "t0"
  )
) AS "t0"
CROSS JOIN "blocks" AS "t1"
WHERE ((((("t0"."res1", -("t0"."res4"))) < (('cb', -(0))))
  AND (("t0"."res5") = (${fungibleName}))) AND (("t0"."res2") = (0)))
  AND (("t0"."res0") = ("t1"."hash"))
ORDER BY "t0"."res3" DESC, "t0"."res1" DESC, "t0"."res4" ASC
) as "t12"
LIMIT ${condition?.take || 21}
OFFSET 0;
`;
  } else if (condition.take >= 0) {
    const { blockHash, chainId, orderIndex, moduleHash, requestKey } =
      condition.cursor.blockHash_chainId_orderIndex_moduleHash_requestKey!;

    return prismaClient.$queryRaw`
      WITH transfers_by_acct AS (

      SELECT
        *
      FROM
        (

          SELECT
            *
          FROM
            transfers

          WHERE
            from_acct = ${accountName}
          ORDER BY
            height DESC,
            requestkey DESC,
            idx ASC
        ) as t0

      UNION ALL

      SELECT
        *
      FROM
        (

          SELECT
            *
          FROM
            transfers

          WHERE
            to_acct = ${accountName}
          ORDER BY
            height DESC,
            requestkey DESC,
            idx ASC
        ) AS t1
      )

      SELECT
        amount,
        block AS block_hash,
        chainid AS chain_id,
        from_acct AS sender_account,
        height,
        idx AS order_index,
        modulehash AS module_hash,
        requestkey AS request_key,
        to_acct AS receiver_account
      FROM
        transfers_by_acct
      WHERE
      (
        ("height", "idx") <= (

          SELECT
            "height",
            "idx"
          FROM
            "transfers"
          WHERE
            (
              block,
              chainid,
              idx,
              modulehash,
              requestkey
            ) = (
              ${blockHash},
              ${chainId},
              ${orderIndex},
              ${moduleHash},
              ${requestKey}
            )
          )
        )
      --AND modulename = ${fungibleName}

      ORDER BY
        height DESC,
        requestkey DESC,
        idx ASC
      OFFSET 1
      LIMIT ${condition?.take || 21};`;
  } else {
    const { blockHash, chainId, orderIndex, moduleHash, requestKey } =
      condition.cursor.blockHash_chainId_orderIndex_moduleHash_requestKey!;

    return prismaClient.$queryRaw`
      WITH transfers_by_acct AS (

      SELECT
        *
      FROM
        (

          SELECT
            *
          FROM
            transfers

          WHERE
            from_acct = ${accountName}
          ORDER BY
            height DESC,
            requestkey DESC,
            idx ASC
        ) as t0

      UNION ALL

      SELECT
        *
      FROM
        (

          SELECT
            *
          FROM
            transfers

          WHERE
            to_acct = ${accountName}
          ORDER BY
            height DESC,
            requestkey DESC,
            idx ASC
        ) AS t1
      )

      SELECT
        amount,
        block AS block_hash,
        chainid AS chain_id,
        from_acct AS sender_account,
        height,
        idx AS order_index,
        modulehash AS module_hash,
        requestkey AS request_key,
        to_acct AS receiver_account
      FROM
        transfers_by_acct
      WHERE
      (
        ("height", "idx") >= (

          SELECT
            "height",
            "idx"
          FROM
            "transfers"
          WHERE
            (
              block,
              chainid,
              idx,
              modulehash,
              requestkey
            ) = (
              ${blockHash},
              ${chainId},
              ${orderIndex},
              ${moduleHash},
              ${requestKey}
            )
          )
        )
      --AND modulename = ${fungibleName}

      ORDER BY
        height DESC,
        requestkey DESC,
        idx ASC
      -- OFFSET ${condition?.skip || 0}
      -- LIMIT ${condition?.take * -1 || 21}
      ;`;
  }
};

export default builder.node(
  builder.objectRef<IFungibleAccount>(FungibleAccountName),
  {
    description: 'A fungible-specific account.',
    id: {
      resolve: (parent) =>
        JSON.stringify([parent.fungibleName, parent.accountName]),
      parse: (id) => ({
        fungibleName: JSON.parse(id)[0],
        accountName: JSON.parse(id)[1],
      }),
    },
    isTypeOf(source) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (source as any).__typename === FungibleAccountName;
    },

    async loadOne({ fungibleName, accountName }) {
      try {
        return {
          __typename: FungibleAccountName,
          accountName,
          fungibleName,
          chainAccounts: [],
          totalBalance: 0,
          transactions: [],
          transfers: [],
        };
      } catch (error) {
        throw normalizeError(error);
      }
    },
    fields: (t) => ({
      accountName: t.exposeString('accountName'),
      fungibleName: t.exposeString('fungibleName'),
      chainAccounts: t.field({
        type: [FungibleChainAccountName],
        complexity: {
          field: COMPLEXITY.FIELD.CHAINWEB_NODE,
        },

        async resolve(parent) {
          try {
            return (
              await Promise.all(
                networkData.chainIds.map((chainId) => {
                  return getFungibleChainAccount({
                    chainId,
                    fungibleName: parent.fungibleName,
                    accountName: parent.accountName,
                  });
                }),
              )
            ).filter(
              (chainAccount) => chainAccount !== null,
            ) as IFungibleChainAccount[];
          } catch (error) {
            throw normalizeError(error);
          }
        },
      }),
      totalBalance: t.field({
        type: 'Decimal',
        complexity: {
          field: COMPLEXITY.FIELD.CHAINWEB_NODE,
        },

        async resolve(parent) {
          try {
            return (
              await Promise.all(
                networkData.chainIds.map(async (chainId) => {
                  return fungibleAccountDetailsLoader.load({
                    fungibleName: parent.fungibleName,
                    accountName: parent.accountName,
                    chainId: chainId,
                  });
                }),
              )
            ).reduce((acc, accountDetails) => {
              if (accountDetails !== null) {
                return acc + accountDetails.balance;
              }
              return acc;
            }, 0);
          } catch (error) {
            throw normalizeError(error);
          }
        },
      }),
      transactions: t.prismaConnection({
        description: 'Default page size is 20.',
        type: Prisma.ModelName.Transaction,
        cursor: 'blockHash_requestKey',
        edgesNullable: false,
        complexity: (args) => ({
          field: getDefaultConnectionComplexity({
            withRelations: true,
            first: args.first,
            last: args.last,
          }),
        }),

        async totalCount(parent) {
          try {
            return await prismaClient.transaction.count({
              where: {
                senderAccount: parent.accountName,
              },
            });
          } catch (error) {
            throw normalizeError(error);
          }
        },

        async resolve(query, parent) {
          try {
            return await prismaClient.transaction.findMany({
              ...query,
              where: {
                senderAccount: parent.accountName,
              },
              orderBy: {
                height: 'desc',
              },
            });
          } catch (error) {
            throw normalizeError(error);
          }
        },
      }),
      transfers: t.prismaConnection({
        description: 'Default page size is 20.',
        type: Prisma.ModelName.Transfer,
        cursor: 'blockHash_chainId_orderIndex_moduleHash_requestKey',
        edgesNullable: false,
        complexity: (args) => ({
          field: getDefaultConnectionComplexity({
            first: args.first,
            last: args.last,
          }),
        }),

        async totalCount(parent) {
          try {
            // return await prismaClient.transfer.count({
            //   where: {
            //     OR: [
            //       {
            //         senderAccount: parent.accountName,
            //       },
            //       {
            //         receiverAccount: parent.accountName,
            //       },
            //     ],
            //   },
            // });
            return 9999;
          } catch (error) {
            throw normalizeError(error);
          }
        },

        async resolve(condition, parent) {
          console.log('condition', JSON.stringify(condition, null, 2));

          try {
            const result = (
              (await getTransfers(
                parent.accountName,
                parent.fungibleName,
                condition,
              )) as any
            ).map(keysToCamel);

            console.log('result', JSON.stringify(result, null, 2));
            return result;
          } catch (error) {
            throw normalizeError(error);
          }
        },
      }),
    }),
  },
);
