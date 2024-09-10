import Paper from '@mui/material/Paper';
import React from 'react';
import Head from 'next/head';

import {
  Box,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { getAuthenticatedAppForUser } from '@/lib/auth/serverApp';
import { getFirestore } from 'firebase/firestore';
import { getMyProjects } from '@/components/fetchData/getMyProjects';

export const dynamic = 'force-dynamic';
const projectsOld = [
  {
    id: 1,
    title: 'Putin chokes on a pretzel',
    stage: 'Completed',
    lastModified: '2023-06-01',
  },
  {
    id: 2,
    title: 'World governments unite to fight climate change',
    stage: 'In Progress',
    lastModified: '2023-06-10',
  },
  {
    id: 3,
    title: 'German scientists achieve cold fusion',
    stage: 'Not Started',
    lastModified: '2023-06-15',
  },
  {
    id: 4,
    title: 'Test123',
    stage: 'Not Started',
    lastModified: '2023-06-16',
  },
];

/*
function getProjects() {
  return projects;
}
*/
export default async function Home({ searchParams }: any) {
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  let myProjects: any = null;
  if (currentUser) {
    myProjects = await getMyProjects(
      getFirestore(firebaseServerApp),
      searchParams
    );
  }

  let projects = null;
  if (myProjects) {
    projects = myProjects[0].projects;
  }
  return (
    <Box>
      <div>
        <title>IMUNA | Home</title>
      </div>
      <Stack spacing={0.5}>
        <Paper elevation={2}>
          <Box sx={{ padding: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Typography variant="h4" component="h1">
                My Projects
              </Typography>
              <Link href="/projects/new" passHref>
                <Button variant="contained" color="primary">
                  New Project
                </Button>
              </Link>
            </Box>
            <List>
              {projects?.map((project: any) => (
                <ListItem
                  key={project.id}
                  sx={{ padding: 2, borderBottom: '1px solid #ddd' }}
                >
                  <Link
                    href={`/projects/${project.projectId}/extractClaims`}
                    passHref
                  >
                    <ListItemText
                      primary={project.title}
                      secondary={`Stage: ${project.stage} | Last Modified: ${project.lastModified}`}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    />
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
