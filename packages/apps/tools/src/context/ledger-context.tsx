import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import type { FC } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
// import { listen } from '@ledgerhq/logs';

import type Transport from '@ledgerhq/hw-transport';

const LedgerContext = createContext<{
  transport: Transport | null;
  connect: () => void;
}>({ transport: null, connect: () => {} });

const LedgerContextProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transport, setTransport] = useState<Transport | null>(null);

  const connect = async () => {
    try {
      const transport = await TransportWebHID.create();

      //listen to the events which are sent by the Ledger packages in order to debug the app
      // listen((log) => console.log('Ledger listen:', log));

      setTransport(transport);

      transport.on('disconnect', () => {
        console.log('useLedgerTransport disconnected');
        setTransport(null);
      });
    } catch (error) {
      console.log(
        'Something went wrong with the Ledger device connection',
        error,
      );
    }
  };

  return (
    <LedgerContext.Provider value={{ transport, connect }}>
      {children}
    </LedgerContext.Provider>
  );
};

const useLedgerTransport = () => {
  console.log('useLedgerTransport');
  const context = useContext(LedgerContext);

  if (context === undefined) {
    throw new Error('Please use LedgerContextProvider in parent component');
  }

  return context;
};

export { LedgerContext, LedgerContextProvider, useLedgerTransport };