import Paper from '@mui/material/Paper';
import React from 'react';
import Head from 'next/head';

import { Box, Stack, Typography } from '@mui/material';

export default async function Contact() {
  return (
    <Box>
      <div>
        <title>IMUNA | Contact</title>
      </div>
      <Paper>
        <Box p={2}>
          <Stack spacing={2}>
            <Typography variant="h4">Contact us</Typography>
            <Typography variant="body1">
              To Contact us please send us an email to:{' '}
              <a href="mailto:daniel.anakiev@gmail.com">
                daniel.anakiev@gmail.com
              </a>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
