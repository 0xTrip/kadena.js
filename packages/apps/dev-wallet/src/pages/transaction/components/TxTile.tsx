import { ITransaction } from '@/modules/transaction/transaction.repository';

import {
  MonoOpenInFull,
  MonoSignature,
  MonoViewInAr,
} from '@kadena/kode-icons/system';
import { Button, Stack, Text } from '@kadena/kode-ui';

import { IPactCommand } from '@kadena/client';

import { Value } from './helpers';
import { codeClass, txTileClass, txTileContentClass } from './style.css';
import { TxPipeLine } from './TxPipeLine';

export const TxTile = ({
  tx,
  contTx,
  onSign,
  onSubmit,
  onView,
  sendDisabled,
}: {
  tx: ITransaction;
  contTx?: ITransaction;
  onSign: () => void;
  onSubmit: () => Promise<ITransaction>;
  onView: () => void;
  sendDisabled?: boolean;
}) => {
  const command: IPactCommand = JSON.parse(tx.cmd);

  return (
    <Stack
      flexDirection={'column'}
      justifyContent={'space-between'}
      className={txTileClass}
      gap={'sm'}
    >
      <Stack flexDirection={'column'} gap={'sm'} flex={1}>
        <TxPipeLine tx={tx} variant="tile" contTx={contTx} />
        {tx.status === 'initiated' && (
          <>
            {'exec' in command.payload && (
              <>
                <Stack
                  gap={'sm'}
                  flexDirection={'column'}
                  overflow="auto"
                  flex={1}
                  className={txTileContentClass}
                >
                  <Value className={codeClass}>
                    <span title={command.payload.exec.code}>
                      {command.payload.exec.code}
                    </span>
                  </Value>
                </Stack>
              </>
            )}
            {'cont' in command.payload && (
              <>
                <Stack gap={'sm'} flexDirection={'column'}>
                  <Text>Continuation</Text>
                  <Value>
                    {command.payload.cont.pactId}- step(
                    {command.payload.cont.step})
                  </Value>
                </Stack>
              </>
            )}
          </>
        )}
        {tx.status === 'signed' && (
          <>
            <Stack
              gap={'sm'}
              flexDirection={'column'}
              overflow="auto"
              flex={1}
              justifyContent={'flex-end'}
              paddingBlockEnd={'sm'}
            >
              <Text size="small">
                The transaction is Signed; you can now sent to to the blockchain
              </Text>
            </Stack>
          </>
        )}
      </Stack>
      <Stack justifyContent={'space-between'} alignItems={'center'}>
        <Stack alignItems={'center'}>
          {tx.status === 'initiated' && (
            <Button isCompact onClick={onSign} variant="outlined">
              <Stack gap={'sm'} alignItems={'center'}>
                <MonoSignature scale={0.5} />
                Sign
              </Stack>
            </Button>
          )}
          {tx.status === 'signed' && !sendDisabled && (
            <Button isCompact variant="outlined">
              <Stack gap={'sm'} alignItems={'center'} onClick={onSubmit}>
                <MonoViewInAr />
                Send
              </Stack>
            </Button>
          )}
        </Stack>
        <Button variant="outlined" isCompact onClick={onView}>
          <Stack gap={'sm'} alignItems={'center'}>
            <MonoOpenInFull />
            Expand
          </Stack>
        </Button>
      </Stack>
    </Stack>
  );
};
