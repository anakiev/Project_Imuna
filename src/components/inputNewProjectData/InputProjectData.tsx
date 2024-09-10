'use client';
import * as React from 'react';
import Card from '@/components/inputNewProjectData/UploadMultimediaCard';
import Stack from '@mui/material/Stack';
import ImageUploader from './ImpageUploader';
import {
  Alert,
  Box,
  Button,
  Grid,
  Link,
  Paper,
  TextField,
} from '@mui/material';

export default function InputProjectData({
  setTitle,
  setArticleText,
  setMultimedia,
}: any) {
  return (
    <Grid container paddingLeft={15} columnSpacing={{ xs: 12 }}>
      <Grid xs={2}>
        <Paper elevation={0}>
          <Alert variant="filled" severity="info" sx={{ mb: 5 }}>
            Upload Multimedia here.
          </Alert>
          <Stack spacing={5} justifyContent="center" alignItems="center">
            <ImageUploader setMultimedia={setMultimedia} />
          </Stack>
        </Paper>
      </Grid>
      <Grid xs={8}>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { ml: 10, mb: 5, width: '120ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            id="filled-basic"
            label="Title"
            variant="filled"
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            id="filled-multiline-static"
            label="Article Text"
            multiline
            rows={25}
            defaultValue=""
            variant="filled"
            onChange={(e) => {
              setArticleText(e.target.value);
            }}
          />
        </Box>
      </Grid>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      ></Box>
    </Grid>
  );
}
