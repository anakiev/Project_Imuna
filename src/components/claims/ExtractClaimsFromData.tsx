'use client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import {
  Alert,
  Box,
  Button,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import ClaimsComponent from '@/components/claims/ClaimsComponent';
import { useSearchParams } from 'next/navigation';
import { getProjectData } from '@/components/fetchData/getProjectData';
import { auth } from '@/lib/auth/clientApp';
import Image from 'next/image';
export default function ExtractClaimsFromData({ id }: { id: number }) {
  const searchParams = useSearchParams();
  const [articleData, setArticleData] = React.useState<{
    title: string;
    article_text: string;
    images: string[];
  } | null>(null); // State for article data
  // let userid = auth.currentUser?.uid || '';
  React.useEffect(() => {
    // Fetch article data based on the 'id'
    const fetchArticleData = async () => {
      try {
        let project = await getProjectData(auth.currentUser?.uid, id);
        // console.log('project=' + JSON.stringify(project));
        let allImages = project.multimedia.map((image: any) => image.url);
        let article = {
          title: project.title,
          article_text: project.article_text,
          images: allImages,
        };
        setArticleData(article);
      } catch (error) {
        console.error('Error fetching article data:', error);
        // Handle the error (e.g., show an error message)
      }
    };

    fetchArticleData();
  }, [id, auth.currentUser]); // Fetch data whenever the 'id' changes
  return (
    <Grid container paddingLeft={0} columnSpacing={{ xs: 2 }}>
      <Grid item xs={6} pl={15}>
        {articleData ? (
          <Box>
            <Typography variant="h4" gutterBottom>
              {articleData.title}
            </Typography>
            <Typography variant="body1">{articleData.article_text}</Typography>
            {/* Render images if available in articleData */}
            {articleData.images &&
              articleData.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Image ${index}`}
                  width={500}
                  height={500}
                />
              ))}
          </Box>
        ) : (
          <Typography variant="body1">Loading article...</Typography>
        )}
      </Grid>

      <Grid item xs={6}>
        <ClaimsComponent
          data={{
            article_text: articleData?.article_text,
            title: articleData?.title,
            images: articleData?.images,
          }}
          projectId={id}
          userId={auth.currentUser?.uid}
        />
      </Grid>
    </Grid>
  );
}
