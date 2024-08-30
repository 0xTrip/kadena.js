import { Assets } from '@/Components/Assets/Assets';
import { ListItem } from '@/Components/ListItem/ListItem';
import { useNetwork } from '@/modules/network/network.hook';
import { useWallet } from '@/modules/wallet/wallet.hook';
import {
  listClass,
  noStyleLinkClass,
  panelClass,
} from '@/pages/home/style.css.ts';
import { getAccountName } from '@/utils/helpers';
import { Box, Heading, Stack, Text } from '@kadena/kode-ui';
import { Link } from 'react-router-dom';
import { linkClass } from '../select-profile/select-profile.css';

export function HomePage() {
  const { accounts, keysets, profile, fungibles } = useWallet();

  const { activeNetwork } = useNetwork();
  console.log('activeNetwork', activeNetwork);

  return (
    <>
      <Box>
        <Text>Welcome back</Text>
        <Heading as="h1">{profile?.name}</Heading>
        <Box className={panelClass} marginBlockStart="xl">
          <Heading as="h4">Your assets</Heading>
          <Box marginBlockStart={'sm'}>
            <Assets accounts={accounts} fungibles={fungibles} showAddToken />
          </Box>
        </Box>
        <Box className={panelClass} marginBlockStart="xs">
          <Heading as="h4">{accounts.length} accounts</Heading>
          <Link to="/create-account" className={linkClass}>
            Create Account
          </Link>
          <Box marginBlockStart="md">
            <Text>Owned ({accounts.length})</Text>
            {keysets.length ? (
              <ul className={listClass}>
                {accounts.map(({ overallBalance, keyset }) => (
                  <li key={keyset?.principal}>
                    <Link
                      to={`/keyset/${keyset?.uuid}`}
                      className={noStyleLinkClass}
                    >
                      <ListItem>
                        <Text>
                          {keyset?.alias || getAccountName(keyset!.principal)}
                        </Text>
                        <Stack alignItems={'center'} gap={'sm'}>
                          <Text>{overallBalance} KDA</Text>
                        </Stack>
                      </ListItem>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Box>
        </Box>
      </Box>
    </>
  );
}
