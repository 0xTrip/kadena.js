import z from 'zod';

import type { ChainId, IPactCommand } from '@kadena/client';

const legacyCapSchema = z
  .object({
    public: z.string(),
    caps: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()),
      }),
    ),
  })
  .transform((sig) => ({
    pubKey: sig.public,
    clist: sig.caps,
  }));

const legacy2CapSchema = z
  .object({
    pubKey: z.string(),
    caps: z.array(
      z.object({
        name: z.string(),
        args: z.array(z.any()),
      }),
    ),
  })
  .transform((sig) => ({
    pubKey: sig.pubKey,
    clist: sig.caps,
  }));

const capSchema = z.object({
  pubKey: z.string(),
  clist: z.array(
    z.object({
      name: z.string(),
      args: z.array(z.any()),
    }),
  ),
});

const templatePartialMetaSchema = z.object({
  // Could be optional if doing local calls
  sender: z.string(),
  // Technically optional, not kadena-client's type requires it
  chainId: z.string().transform((chainId) => chainId as ChainId),
  creationTime: z.number().optional(),
  gasLimit: z.number().optional(),
  gasPrice: z.number().optional(),
  ttl: z.number().optional(),
});

const templatePartialSchema = z
  .object({
    payload: z.object({
      exec: z.object({
        code: z.string(),
        data: z.record(z.any()).optional().default({}),
      }),
    }),
    signers: z.array(z.union([capSchema, legacy2CapSchema, legacyCapSchema])),
    meta: templatePartialMetaSchema.optional(),
    publicMeta: templatePartialMetaSchema.optional(),
    nonce: z.string().optional().default(''),
    networkId: z.string().optional().default('mainnet01'),
  })
  .transform(({ meta, publicMeta, ...transaction }) => {
    const metaToUse = meta ?? publicMeta;
    if (metaToUse === undefined)
      throw new Error('meta or publicMeta must be defined');
    return { ...transaction, meta: metaToUse };
  });

export const fixTemplatePactCommand = (template: unknown): IPactCommand => {
  const parsed = templatePartialSchema.safeParse(template);
  if (parsed.success) {
    return parsed.data;
  }
  throw new Error(`Failed to parse template:${parsed.error.message}`);
};