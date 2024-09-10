'use client';
import React, { useEffect } from 'react';
import { Box, Stack } from '@mui/material';
// import ProgressBar from '@/components/ProgressBar';
// import InputData from '@/components/InputData';
import ProjectProgressBar from '@/components/projectMultiPurposeComponents/ProjectProgressBar';
import ExtractClaimsFromData from '@/components/claims/ExtractClaimsFromData';

export default function Page({ params }: { params: { id: number } }) {
  useEffect(() => {
    // Ensures that the component is rerendered on the client
  }, []);
  return (
    <Box>
      <Stack spacing={10}>
        <ProjectProgressBar step={2} stepProps={{}} />
        <ExtractClaimsFromData id={params.id} />
      </Stack>
    </Box>
  );
}
