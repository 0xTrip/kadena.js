import type { Command } from 'commander';

import { printWalletKeys } from '../../keys/utils/keysDisplay.js';
import { getAllWallets, getWallet } from '../../keys/utils/keysHelpers.js';
import { createCommand } from '../../utils/createCommand.js';
import { globalOptions } from '../../utils/globalOptions.js';
import { log } from '../../utils/logger.js';

export const createListWalletsCommand: (
  program: Command,
  version: string,
) => void = createCommand(
  'list',
  'List wallet(s)',
  [globalOptions.keyWalletSelectWithAll()],
  async (config) => {
    log.debug('list-keys:action', { config });

    if (config.keyWallet === 'all') {
      const walletNames = await getAllWallets();
      for (const wallet of walletNames) {
        await printWalletKeys(await getWallet(wallet));
      }
    } else if (config.keyWalletConfig === null) {
      return log.error(`Selected wallet "${config.keyWallet}" not found.`);
    }

    await printWalletKeys(config.keyWalletConfig);
  },
);