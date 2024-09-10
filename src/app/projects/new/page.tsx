'use client';
import * as React from 'react';
import { Box, Stack } from '@mui/material';
import ProjectProgressBar from '@/components/projectMultiPurposeComponents/ProjectProgressBar';
import InputProjectData from '@/components/inputNewProjectData/InputProjectData';
import TopBar from '@/components/base/TopBar';
import Head from 'next/head';
// import AppAppBar from '@/components/AppAppBar';

// import Box from '@mui/material/Box';

//import { createContext } from 'react';

// const ThemeContext = createContext('dark');
// const theme = useContext(ThemeContext);

export default function Home() {
  const [title, setTitle] = React.useState('');
  const [articleText, setArticleText] = React.useState('');
  const [multiMedia, setMultimedia] = React.useState<any[]>([]); // Default to empty array
  const stepProps = {
    title: title,
    articleText: articleText,
    multiMedia: multiMedia,
  };

  return (
    <Box>
      <div>
        <title>IMUNA | New Project</title>
      </div>
      <Stack spacing={10} pt={8}>
        <ProjectProgressBar
          step={1}
          stepProps={{
            title: stepProps.title,
            article_text: stepProps.articleText,
            multimedia: stepProps.multiMedia,
          }}
        />
        <InputProjectData
          setArticleText={setArticleText}
          setTitle={setTitle}
          setMultimedia={setMultimedia}
        />
      </Stack>
    </Box>
  );
}
//       /* <AppAppBar mode={mode} toggleColorMode={toggleColorMode} /> */
