import type { IPactCommand } from '@kadena/client';
import type { ICommand, IUnsignedCommand } from '@kadena/types';
import path from 'node:path';
import { WORKING_DIRECTORY } from '../../../constants/config.js';
import { services } from '../../../services/index.js';
import { isPartiallySignedTransaction } from './txHelpers.js';

export interface ISavedTransaction {
  command: ICommand | IUnsignedCommand;
  filePath: string;
  state: string;
}

interface SaveSignedTransactionsOptions {
  directory?: string;
  chainweaverSignatures?: boolean;
}

/**
 * Saves multiple signed transactions
 */
export async function saveSignedTransactions(
  commands: (ICommand | IUnsignedCommand)[],
  options?: SaveSignedTransactionsOptions,
): Promise<ISavedTransaction[]> {
  const result: ISavedTransaction[] = [];
  for (let index = 0; index < commands.length; index++) {
    let command = commands[index];

    const isPartial = isPartiallySignedTransaction(command);
    const state = isPartial ? 'partial' : 'signed';
    const fileDir = options?.directory ?? WORKING_DIRECTORY;
    const filePath = path.join(
      fileDir,
      `transaction-${command.hash.slice(0, 10)}-${state}.json`,
    );

    if (options?.chainweaverSignatures) {
      console.log('chainweaverSignatures', command);
      command = {
        ...command,
        sigs: command.sigs.reduce(
          (acc, sig, index) => {
            const pubKey =
              sig?.pubKey ??
              (JSON.parse(command.cmd) as IPactCommand).signers[index].pubKey;
            acc[pubKey] = sig?.sig ?? null;
            return acc;
          },
          {} as Record<string, string | null>,
        ) as any,
      };
    }

    await services.filesystem.writeFile(
      filePath,
      JSON.stringify(command, null, 2),
    );
    result.push({ command, filePath, state });
  }
  return result;
}