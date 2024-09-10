import * as React from 'react';
import Stack from '@mui/material/Stack';
import { Alert, Box, Button, Grid, Link, TextField } from '@mui/material';
import ClaimsComponent from '@/components/claims/ClaimsComponent';
import ClaimsList from '@/components/claims/ClaimsList';

export default function Knowledgematcher() {
  return (
    <Grid container paddingLeft={0} columnSpacing={{ xs: 2 }}>
      <Grid xs={6} pl={15}>
        <Box>
          <ClaimsList />
        </Box>
      </Grid>
      <Grid xs={6}>
        <ClaimsComponent />
      </Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Link href="/evaluate" component="a">
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              alert('Save and go to next step');
            }}
          >
            Save and go to next step
          </Button>
        </Link>
      </Box>
    </Grid>
  );
}
