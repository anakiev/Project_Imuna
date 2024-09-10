'use client';
import Image from 'next/image';
import { Box, Button, Stack, Typography } from '@mui/material';
import { signInWithGoogle } from '@/lib/auth/auth';
// import ProgressBar from '@/components/ProgressBar';
// import InputData from '@/components/InputData';

import SignInForm from '@/components/base/login/SignInForm';

export default function Home() {
  return (
    <Box>
      <Stack
        paddingTop={10}
        direction="column"
        justifyContent="space-around"
        alignItems="center"
        spacing={2}
      >
        <Typography paddingBottom={10} variant="h4">
          Please Sign In or Sign up to continue
        </Typography>
        <SignInForm />
      </Stack>
    </Box>
  );
}
