import { useLedgerTransport } from '@/context';
import AppKda from '@ledgerhq/hw-app-kda';
// import useLedgerTransport from './use-ledger-transport';

const useLedgerApp = () => {
  const { transport } = useLedgerTransport();
  console.log('useLedgerApp', transport);

  if (transport !== null) {
    return new AppKda(transport);
  }

  return null;
};

export default useLedgerApp;