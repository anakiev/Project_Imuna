'use client';
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { Link } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';

// Material-UI SWitch

import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

import Auth from '@/components/base/Auth';

import { useRouter } from 'next/navigation';
import { firebaseConfig } from '@/lib/auth/config';
import { signInWithGoogle, signOut, onAuthStateChanged } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { usePathname } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff'
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff'
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));
function useUserSession(initialUser: any) {
  // The initialUser comes from the server via a server component
  const [user, setUser] = React.useState(initialUser);
  const router = useRouter();

  // Register the service worker that sends auth state back to server
  // The service worker is built with npm run build-service-worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serializedFirebaseConfig = encodeURIComponent(
        JSON.stringify(firebaseConfig)
      );
      const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`;

      navigator.serviceWorker
        .register(serviceWorkerUrl)
        .then((registration) => console.log('scope is: ', registration.scope));
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser: any) => {
      setUser(authUser);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    onAuthStateChanged((authUser: any) => {
      if (user === undefined) return;

      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh();
      }
      router.refresh();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return user;
}
const handleSignOut = (event: any) => {
  event.preventDefault();
  signOut();
};
const displaySignOut = (user: any) => {
  if (user) {
    return (
      <Button color="inherit" href="#" onClick={handleSignOut}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Typography>Sign Out</Typography>
          <LogoutIcon></LogoutIcon>
        </Stack>
      </Button>
    );
  }
  return <div></div>;
};

const checkAuthState = (user: any, pathname: any, redirect: any) => {
  if (!user && pathname !== '/signIn') {
    redirect('/signIn');
  }
  if (user && pathname === '/signIn') {
    redirect('/');
  }
};
export default function Header(initialUser: any) {
  const { mode, setMode } = useColorScheme();
  const pathname = usePathname();
  const user = useUserSession(initialUser);
  const router = useRouter();

  React.useEffect(() => {
    checkAuthState(user, pathname, router.push);
  }, [user, pathname, router]);
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" underline="none" color="inherit">
              <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Image
                  src="/icon.png"
                  width={60}
                  height={60}
                  alt="Logo of the IMuNA App"
                ></Image>
                <Typography variant="h4" component="h2">
                  IMUNA
                </Typography>
              </Stack>
            </Link>
          </Typography>
          <Typography variant="body1">{user?.email}</Typography>
          <MaterialUISwitch
            checked={mode === 'dark'}
            onChange={() => {
              setMode(mode === 'light' ? 'dark' : 'light');
            }}
            name="checkedA"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          ></MaterialUISwitch>
          {displaySignOut(user)}
        </Toolbar>
      </AppBar>
      {
        //<Auth initialUser={initialUser} />
      }
    </Box>
  );
}
