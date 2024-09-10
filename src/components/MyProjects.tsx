import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuthenticatedAppForUser } from '@/lib/auth/serverApp.js';
import { getFirestore } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// Sample data
const projects = [
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

function getProjects() {
  return projects;
}

const MyProjects = async () => {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // const restaurants = await getRestaurants(getFirestore(firebaseServerApp), searchParams);
  return (
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
        {projects.map((project) => (
          <ListItem
            key={project.id}
            sx={{ padding: 2, borderBottom: '1px solid #ddd' }}
          >
            <Link href={`/projects/${project.id}`} passHref>
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
  );
};

export default MyProjects;
