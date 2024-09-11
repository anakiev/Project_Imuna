'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';
import { auth, db } from '@/lib/auth/clientApp';
import { getMyProjects } from '@/components/fetchData/getMyProjects';

export default function Home({ searchParams }: any) {
  const [myProjects, setMyProjects] = useState<any>(null);
  const [projects, setProjects] = useState<any>(null);

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (auth.currentUser) {
        const projectsData = await getMyProjects(db, searchParams);
        setMyProjects(projectsData);
      }
    };

    fetchMyProjects();
  }, [searchParams]); // Re-fetch projects if searchParams change

  useEffect(() => {
    if (myProjects && myProjects[0]) {
      setProjects(myProjects[0].projects);
    }
  }, [myProjects]); // Update projects when myProjects changes

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
              {projects &&
                projects?.map((project: any) => (
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
                        // secondary={`Stage: ${project.stage} | Last Modified: ${project.lastModified}`}
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
