'use client';
import { Box, Stack, TextField } from '@mui/material';
// import ProgressBar from '@/components/ProgressBar';
// import InputData from '@/components/InputData';
import ProjectProgressBar from '@/components/projectMultiPurposeComponents/ProjectProgressBar';
import FactsList from '@/components/facts/FactsList';
import ClaimsList from '@/components/claims/ClaimsList';
import { auth } from '@/lib/auth/clientApp';
import { getProjectData } from '@/components/fetchData/getProjectData';
import React from 'react';
import { usePathname } from 'next/navigation';

export function extractProjectID(str: string) {
  const regex = /\/projects\/([^\/]+)\/.*/;
  const match = str.match(regex);
  return match ? match[1] : '0';
}

export default function Home() {
  const pathname = usePathname();
  const id = parseInt(extractProjectID(pathname));
  const [articleData, setArticleData] = React.useState<any>(null); // State for article data
  const [claims, setClaims] = React.useState<any>(null); // State for article data
  const [selectedClaimIndex, setSelectedClaimIndex] = React.useState(-1); // State for selected claim index

  let userid = auth.currentUser?.uid || '';
  React.useEffect(() => {
    // Fetch article data based on the 'id'
    const fetchArticleData = async () => {
      try {
        let project = await getProjectData(userid, id);
        let allImages = project.multimedia.map((image: any) => image.url);
        let article = {
          title: project.title,
          article_text: project.article_text,
          images: allImages,
        };
        setArticleData(article);
        setClaims(project.claims);
      } catch (error) {
        console.error('Error fetching article data:', error);
        // Handle the error (e.g., show an error message)
      }
    };
    if (!articleData || !claims) {
      fetchArticleData();
    }
  }, [auth, userid, id, claims]); // Fetch data whenever the 'id' changes

  const handleIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value, 10);
    // Ensure the new index is within bounds
    setSelectedClaimIndex(
      newIndex >= 0 && newIndex < (claims?.length || 0) ? newIndex : -1
    );
  };

  return (
    <Stack
      spacing={10}
      direction="column"
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ProjectProgressBar step={3} stepProps={{}} />
      <TextField
        sx={{ mt: 60 }}
        label="Filter Facts by Claim Index"
        type="number"
        value={selectedClaimIndex}
        onChange={handleIndexChange}
      />
      <Stack direction={'row'}>
        <ClaimsList
          /*
                    claims={[
                        {
                            claim:
                                'At the same time, land in urban areas is becoming increasingly scarce and builders are opting to reduce square footage to maximize the number of units they can build.',
                            claim_date: '2023-10-27',
                            speaker: 'Dayna Drake',
                            reporting_source: 'Newsweek',
                            location_ISO_code: 'US',
                            source_medium: 'news',
                            claim_types: ['causal claim'],
                        },
                    ]}
                    */
          claims={claims || []}
        />
        <FactsList claims={claims} selectedClaimIndex={selectedClaimIndex} />
      </Stack>
    </Stack>
  );
}
