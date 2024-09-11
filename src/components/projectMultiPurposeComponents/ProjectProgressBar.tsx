'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
// import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { useRouter } from 'next/navigation';
import { createNewProject } from '@/components/fetchData/createNewProject';
import { NewProject } from '@/components/fetchData/createNewProject';
import { auth, db } from '@/lib/auth/clientApp';
import { getMyProfile } from '../fetchData/getMyProfile';
import { usePathname } from 'next/navigation';

const steps = [
  'Input Data',
  'Extract Claims',
  'Search for Facts',
  'Evaluate and Verify',
];

const nextStep = (currentStep: number, projectID: string) => {
  switch (currentStep) {
    case 1:
      return '/projects/' + projectID + '/extractClaims';
    case 2:
      return '/projects/' + projectID + '/knowledgematching';
    case 3:
      return '/projects/' + projectID + '/evaluation';
    case 4:
      return '/projects/' + projectID + '/evaluation';
    default:
      return '/projects/new';
  }
};

const previousStep = (currentStep: number, projectID: string) => {
  switch (currentStep) {
    case 1:
      return '/projects/new';
    case 2:
      return '/projects/new';
    case 3:
      return '/projects/' + projectID + '/extractClaims';
    case 4:
      return '/projects/' + projectID + '/knowledgematching';

    default:
      return '/project/new';
  }
};
function extractProjectID(str: string) {
  const regex = /\/projects\/([^\/]+)\/.*/;
  const match = str.match(regex);
  return match ? match[1] : '0';
}

export default function ProjectProgressBar({
  step,
  stepProps,
}: {
  step: number;
  stepProps: NewProject | any;
}) {
  const router = useRouter();
  const currentUser = auth.currentUser;
  const pathname = usePathname();

  const [profile, setProfile] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProfiles = await getMyProfile(db, {});
        setProfile(fetchedProfiles[0]);
      } catch (err) {
        setError('Error fetching profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []); // Empty dependency array ensures this runs once on mount
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ width: '100%' }}
      justifyContent="space-evenly"
      paddingTop={4}
    >
      {step != 1 ? (
        <div>
          <Link
            href={previousStep(step, extractProjectID(pathname))}
            component="a"
          >
            <Button
              color="primary"
              variant="contained"
              disabled={step == 1 ? true : false}
            >
              BACK
            </Button>
          </Link>
        </div>
      ) : (
        <Button
          color="primary"
          variant="contained"
          disabled={step == 1 ? true : false}
        >
          BACK
        </Button>
      )}
      <Stepper activeStep={step - 1} alternativeLabel sx={{ width: '65%' }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {step != 4 ? (
        <div>
          <Button
            color="primary"
            variant="contained"
            disabled={step == 4 ? true : false}
            onClick={() => {
              if (step == 1) {
                let newProject: NewProject = {
                  title: stepProps.title,
                  article_text: stepProps.article_text,
                  multimedia: stepProps.multimedia,
                };
                const projectId =
                  profile && profile.projects && profile.projects.length
                    ? profile.projects.length
                    : 0;
                createNewProject(newProject, projectId);
                router.push('/projects/' + projectId + '/extractClaims');
              } else {
                router.push(nextStep(step, extractProjectID(pathname)));
              }
            }}
          >
            NEXT
          </Button>
        </div>
      ) : (
        <Button
          color="primary"
          variant="contained"
          disabled={step == 4 ? true : false}
        >
          NEXT
        </Button>
      )}
    </Stack>
  );
}
