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
    console.log('no condition');

    return prismaClient.$queryRaw`
SELECT
	"t0"."res1" AS "block_hash",
	"t0"."res2" AS "request_key",
	"t0"."res3" AS "chain_id",
	"t0"."res4" AS "height",
	"t0"."res5" AS "order_index",
	"t0"."res6" AS "module_name",
	"t0"."res7" AS "module_hash",
	"t0"."res8" AS "sender_account",
	"t0"."res9" AS "receiver_account",
	"t0"."res10" AS "amount",
	"t0"."res11" AS "row_number",
	"t0"."res0" AS "is_fungible"
      FROM
	(
		SELECT
			("t0"."res5") = (${fungibleName}) AS "res0",
			"t0"."res0" AS "res1",
			"t0"."res1" AS "res2",
			"t0"."res2" AS "res3",
			"t0"."res3" AS "res4",
			"t0"."res4" AS "res5",
			"t0"."res5" AS "res6",
			"t0"."res6" AS "res7",
			"t0"."res7" AS "res8",
			"t0"."res8" AS "res9",
			"t0"."res9" AS "res10",
			ROW_NUMBER() OVER (
				ORDER BY
					"t0"."res3" DESC,
					"t0"."res1" DESC,
					"t0"."res4" ASC
			) AS "res11"
		FROM
			(
				(
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."from_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
				UNION
				ALL (
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."to_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
			) AS "t0"
		LIMIT
			50000
	) AS "t0"
	WHERE "t0"."res0" = true
      ORDER BY
	"t0"."res4" DESC,
	"t0"."res2" DESC,
	"t0"."res5" ASC
OFFSET ${condition?.skip || 0}
LIMIT ${condition?.take || 21};
	`;
  } else if (condition.take >= 0) {
    const { blockHash, chainId, orderIndex, moduleHash, requestKey } =
      condition.cursor.blockHash_chainId_orderIndex_moduleHash_requestKey!;

    console.log('condition.take is positive, page forward');
    return prismaClient.$queryRaw`
      SELECT
	"t0"."res1" AS "block_hash",
	"t0"."res2" AS "request_key",
	"t0"."res3" AS "chain_id",
	"t0"."res4" AS "height",
	"t0"."res5" AS "order_index",
	"t0"."res6" AS "module_name",
	"t0"."res7" AS "module_hash",
	"t0"."res8" AS "sender_account",
	"t0"."res9" AS "receiver_account",
	"t0"."res10" AS "amount",
	"t0"."res11" AS "row_number",
	"t0"."res0" AS "is_fungible"
            FROM
	(
		SELECT
			("t0"."res5") = (${fungibleName}) AS "res0",
			"t0"."res0" AS "res1",
			"t0"."res1" AS "res2",
			"t0"."res2" AS "res3",
			"t0"."res3" AS "res4",
			"t0"."res4" AS "res5",
			"t0"."res5" AS "res6",
			"t0"."res6" AS "res7",
			"t0"."res7" AS "res8",
			"t0"."res8" AS "res9",
			"t0"."res9" AS "res10",
			ROW_NUMBER() OVER (
				ORDER BY
					"t0"."res3" DESC,
					"t0"."res1" DESC,
					"t0"."res4" ASC
			) AS "res11"
		FROM
			(
				(
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."from_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
				UNION
				ALL (
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."to_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
			) as "t0"
		 WHERE
      (
        (t0."res3", t0."res4") <= (

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
		LIMIT
			50000
	) AS "t0"
	WHERE "t0"."res0" = true
            ORDER BY
	"t0"."res4" DESC,
	"t0"."res2" DESC,
	"t0"."res5" ASC
OFFSET ${condition?.skip || 0}
LIMIT ${condition?.take || 21};
`;
  } else {
    const { blockHash, chainId, orderIndex, moduleHash, requestKey } =
      condition.cursor.blockHash_chainId_orderIndex_moduleHash_requestKey!;
    console.log('condition is negative, page back');

    return prismaClient.$queryRaw`
      SELECT
	"t0"."res1" AS "block_hash",
	"t0"."res2" AS "request_key",
	"t0"."res3" AS "chain_id",
	"t0"."res4" AS "height",
	"t0"."res5" AS "order_index",
	"t0"."res6" AS "module_name",
	"t0"."res7" AS "module_hash",
	"t0"."res8" AS "sender_account",
	"t0"."res9" AS "receiver_account",
	"t0"."res10" AS "amount",
	"t0"."res11" AS "row_number",
	"t0"."res0" AS "is_fungible"
            FROM
	(
		SELECT
			("t0"."res5") = (${fungibleName}) AS "res0",
			"t0"."res0" AS "res1",
			"t0"."res1" AS "res2",
			"t0"."res2" AS "res3",
			"t0"."res3" AS "res4",
			"t0"."res4" AS "res5",
			"t0"."res5" AS "res6",
			"t0"."res6" AS "res7",
			"t0"."res7" AS "res8",
			"t0"."res8" AS "res9",
			"t0"."res9" AS "res10",
			ROW_NUMBER() OVER (
				ORDER BY
					"t0"."res3" DESC,
					"t0"."res1" DESC,
					"t0"."res4" ASC
			) AS "res11"
		FROM
			(
				(
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."from_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
				UNION
				ALL (
					SELECT
						"t0"."res0" AS "res0",
						"t0"."res1" AS "res1",
						"t0"."res2" AS "res2",
						"t0"."res3" AS "res3",
						"t0"."res4" AS "res4",
						"t0"."res5" AS "res5",
						"t0"."res6" AS "res6",
						"t0"."res7" AS "res7",
						"t0"."res8" AS "res8",
						"t0"."res9" AS "res9"
					FROM
						(
							SELECT
								"t0"."block" AS "res0",
								"t0"."requestkey" AS "res1",
								"t0"."chainid" AS "res2",
								"t0"."height" AS "res3",
								"t0"."idx" AS "res4",
								"t0"."modulename" AS "res5",
								"t0"."modulehash" AS "res6",
								"t0"."from_acct" AS "res7",
								"t0"."to_acct" AS "res8",
								"t0"."amount" AS "res9"
							FROM
								"transfers" AS "t0"
							WHERE
								("t0"."to_acct") = (
									${accountName}
								)
							ORDER BY
								"t0"."height" DESC,
								"t0"."requestkey" DESC,
								"t0"."idx" ASC
						) AS "t0"
				)
			) as "t0"
		 WHERE
      (
        (t0."res3", "res4") > (

          SELECT
            "height" as "res3",
            "idx" as "res4"
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
		LIMIT
			50000
	) AS "t0"
WHERE "t0"."res0" = true
ORDER BY
	"t0"."res4" DESC,
	"t0"."res2" DESC,
	"t0"."res5" ASC
OFFSET ${condition?.skip || 0}
LIMIT ${condition?.take * -1 || 20};
`;
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

            return result;
          } catch (error) {
            throw normalizeError(error);
          }
        },
      }),
    }),
  },
);
