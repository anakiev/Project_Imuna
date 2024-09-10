import { Inter } from 'next/font/google';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { theme } from './theme';
const inter = Inter({ subsets: ['latin'] });
import { getInitColorSchemeScript } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Stack } from '@mui/material';
import Header from '@/components/base/Header';
import Footer from '@/components/base/Footer';
// Auth
import { getAuthenticatedAppForUser } from '@/lib/auth/serverApp';
export const dynamic = 'force-dynamic';

//         {getInitColorSchemeScript()}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser();

  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppRouterCacheProvider>
          <CssVarsProvider theme={theme}>
            <CssBaseline />
            <Header initialUser={currentUser?.toJSON()} />

            <Box component="main" sx={{ flex: 1 }}>
              {children}
            </Box>

            <Box component="footer" sx={{ width: '100%' }}>
              <Footer />
            </Box>
          </CssVarsProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
