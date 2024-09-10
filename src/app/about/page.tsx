import Paper from '@mui/material/Paper';
import React from 'react';
import Head from 'next/head';

import { Box, Stack, Typography } from '@mui/material';

export default async function About() {
  return (
    <Box>
      <div>
        <title>IMUNA | About</title>
      </div>
      <Paper>
        <Box p={2}>
          <Stack spacing={2}>
            <Typography variant="h4">About</Typography>
            <Typography variant="body1">
              This is an application for multimodal news analysis. With the help
              of LLMs it extracts claims, find relevant knowledge and assesses
              the veracity of the claim.
            </Typography>
            <Typography variant="body1">
              For any questions or feedback, please{' '}
              <Typography variant="body1" component="span" color="primary">
                <a href="/contact">contact</a> us.{' '}
              </Typography>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
