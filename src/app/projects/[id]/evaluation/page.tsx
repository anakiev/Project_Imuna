'use client';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Collapse,
  IconButton,
  Grid,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProjectProgressBar from '@/components/projectMultiPurposeComponents/ProjectProgressBar';
import FactsList from '@/components/facts/FactsList';
import ClaimsList from '@/components/claims/ClaimsList';
import { auth, db } from '@/lib/auth/clientApp';
import { getProjectData } from '@/components/fetchData/getProjectData';
import React from 'react';
import { redirect, usePathname } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

function extractProjectID(str: string) {
  const regex = /\/projects\/([^\/]+)\/.*/;
  const match = str.match(regex);
  return match ? match[1] : '0';
}

export default function Home() {
  const pathname = usePathname();
  const id = parseInt(extractProjectID(pathname));
  const [projectData, setProjectData] = React.useState<any>(null);
  const [selectedClaimIndex, setSelectedClaimIndex] = React.useState(-1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [claimEvaluations, setClaimEvaluations] = React.useState<any>(null);
  const [articleEvaluation, setArticleEvaluation] = React.useState<any>(null);
  const [isEditingArticle, setIsEditingArticle] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [expandedEvaluations, setExpandedEvaluations] = React.useState<
    number[]
  >([]);
  const [isLoadingArticle, setIsLoadingArticle] = React.useState(false);
  const router = useRouter();

  let userid = auth.currentUser?.uid || '';

  React.useEffect(() => {
    const fetchArticleData = async () => {
      try {
        let project = await getProjectData(userid, id);
        let allImages = project.multimedia.map((image: any) => image.url);
        project.allImages = allImages;
        setProjectData(project);
      } catch (error) {
        console.error('Error fetching article data:', error);
      }
    };
    if (!projectData) {
      fetchArticleData();
    }
  }, [auth, userid, id, projectData]);

  const handleIndexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(event.target.value, 10);
    setSelectedClaimIndex(
      newIndex >= 0 && newIndex < (projectData.claims?.length || 0)
        ? newIndex
        : -1
    );
  };

  const handleGenerateEvaluation = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/claimEvaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claims: projectData.claims }),
      });
      if (response.ok) {
        const data = await response.json();
        setClaimEvaluations(JSON.parse(data));
        console.log(JSON.parse(data));
      } else {
        const errorData = await response.json();
        console.error(
          'Error generating AI evaluation:',
          errorData.message || response.statusText
        );
      }
    } catch (error) {
      console.error('Error generating AI evaluation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveClaimsGenerateReport = async () => {
    setIsLoadingArticle(true);
    saveClaimsToFireStore(claimEvaluations, id, userid);
    try {
      const response = await fetch('/api/articleEvaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claims: claimEvaluations,
          articleText: projectData.article_text,
          articleTitle: projectData.title,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setArticleEvaluation(JSON.parse(data));
        console.log(JSON.parse(data));
      } else {
        const errorData = await response.json();
        console.error(
          'Error generating AI evaluation:',
          errorData.message || response.statusText
        );
      }
    } catch (error) {
      console.error('Error generating AI evaluation:', error);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // ... (your save logic here - replace with your actual implementation)
      console.log('Saving updated claimEvaluations:', claimEvaluations);
    } catch (error) {
      console.error('Error saving claim evaluations:', error);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  if (!projectData) {
    return <div>Loading...</div>;
  } else if (articleEvaluation) {
    return (
      <Box sx={{ mt: 12, mb: 12, border: '1px solid lightgray', p: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
          Article Evaluation
        </Typography>
        <Divider />

        {/* Edit Button */}
        <Button onClick={() => setIsEditingArticle(true)} sx={{ mb: 2 }}>
          Edit
        </Button>

        {isEditingArticle ? (
          // Render editable fields for articleEvaluation
          <>
            <TextField
              fullWidth
              multiline
              label="Verdict"
              value={articleEvaluation.verdict}
              onChange={(e) =>
                setArticleEvaluation({
                  ...articleEvaluation,
                  verdict: e.target.value,
                })
              }
            />
            <Divider />

            <TextField
              fullWidth
              multiline
              label="Justification"
              value={articleEvaluation.justification}
              onChange={(e) =>
                setArticleEvaluation({
                  ...articleEvaluation,
                  justification: e.target.value,
                })
              }
            />
            <Button onClick={() => setIsEditingArticle(false)} sx={{ mt: 2 }}>
              Save changes
            </Button>
          </>
        ) : (
          // Render non-editable display of articleEvaluation
          <>
            <Typography>
              <strong>Verdict:</strong> {articleEvaluation.verdict}
            </Typography>
            <Divider />

            <Typography>
              <strong>Justification:</strong> {articleEvaluation.justification}
            </Typography>
            <Divider />
          </>
        )}
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            let article: any = {};
            article['articleTitle'] = projectData.title;
            article['articleText'] = projectData.article_text;
            article['claim_eval'] = claimEvaluations;
            article['verdict'] = articleEvaluation.verdict;
            article['justification'] = articleEvaluation.justification;
            saveArticleEvaluationToFireStore(article, id, userid);
            router.push('/');
          }}
        >
          Persist Data
        </Button>
      </Box>
    );
  } else if (claimEvaluations) {
    return (
      <Stack
        spacing={10}
        direction="column"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ProjectProgressBar step={4} stepProps={{}} />
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGenerateEvaluation}
            disabled={true}
          >
            {isLoading ? 'Generating...' : 'Generate AI Evaluation for Claims'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveClaimsGenerateReport}
            disabled={isLoadingArticle}
          >
            {isLoadingArticle
              ? 'Saving Claims and Generating Report...'
              : 'Save Claims Evaluation to DB and Generate Article Report'}
          </Button>
        </Stack>
        {claimEvaluations && (
          <div>
            {claimEvaluations.map((evaluation: any, index: number) => {
              const isExpanded = expandedEvaluations.includes(index);

              const handleExpandClick = () => {
                setExpandedEvaluations((prevExpanded) =>
                  isExpanded
                    ? prevExpanded.filter((item) => item !== index)
                    : [...prevExpanded, index]
                );
              };

              return (
                <Box
                  key={index}
                  sx={{ mb: 2, border: '1px solid lightgray', p: 2 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid lightgray',
                      borderRadius: '8px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                      mb: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Claim {index + 1}
                      </Typography>
                      <IconButton
                        onClick={handleExpandClick}
                        aria-expanded={isExpanded}
                        aria-label="show more"
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Claim:</strong> {evaluation.claim}
                        </Typography>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Label:</strong> {evaluation.label}
                        </Typography>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1">
                          <strong>Justification:</strong>{' '}
                          {evaluation.justification}
                        </Typography>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Claim Date:</strong>{' '}
                          {evaluation.claim_date || 'N/A'}
                        </Typography>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1">
                          <strong>Speaker:</strong>{' '}
                          {evaluation.speaker || 'N/A'}
                        </Typography>
                        <Divider />
                      </Grid>
                    </Grid>
                  </Box>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    {isEditing ? (
                      <>
                        <TextField
                          fullWidth
                          multiline
                          value={evaluation.claim}
                          onChange={(e) => {
                            const newClaimEvaluations = [...claimEvaluations];
                            newClaimEvaluations[index].claim = e.target.value;
                            setClaimEvaluations(newClaimEvaluations);
                          }}
                        />
                        <TextField
                          fullWidth
                          value={evaluation.label}
                          onChange={(e) => {
                            const newClaimEvaluations = [...claimEvaluations];
                            newClaimEvaluations[index].label = e.target.value;
                            setClaimEvaluations(newClaimEvaluations);
                          }}
                        />
                        <TextField
                          fullWidth
                          multiline
                          value={evaluation.justification}
                          onChange={(e) => {
                            const newClaimEvaluations = [...claimEvaluations];
                            newClaimEvaluations[index].justification =
                              e.target.value;
                            setClaimEvaluations(newClaimEvaluations);
                          }}
                        />
                        <TextField
                          fullWidth
                          value={evaluation.claim_date || ''}
                          onChange={(e) => {
                            const newClaimEvaluations = [...claimEvaluations];
                            newClaimEvaluations[index].claim_date =
                              e.target.value;
                            setClaimEvaluations(newClaimEvaluations);
                          }}
                        />
                        <TextField
                          fullWidth
                          value={evaluation.speaker || ''}
                          onChange={(e) => {
                            const newClaimEvaluations = [...claimEvaluations];
                            newClaimEvaluations[index].speaker = e.target.value;
                            setClaimEvaluations(newClaimEvaluations);
                          }}
                        />
                        {/* ... Add other editable fields similarly */}
                      </>
                    ) : (
                      <>
                        <Typography>Claim: {evaluation.claim}</Typography>
                        <Divider />
                        <Typography>Label: {evaluation.label}</Typography>
                        <Divider />

                        <Typography>
                          Justification: {evaluation.justification}
                        </Typography>
                        <Divider />

                        <Typography>
                          Claim Date: {evaluation.claim_date || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Speaker: {evaluation.speaker || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Original Claim URL:{' '}
                          {evaluation.original_claim_url || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Cached Original Claim URL:{' '}
                          {evaluation.cached_original_claim_url || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Fact-checking Article:{' '}
                          {evaluation.fact_checking_article || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Reporting Source:{' '}
                          {evaluation.reporting_source || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Location ISO Code:{' '}
                          {evaluation.location_ISO_code || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Claim Types:{' '}
                          {evaluation.claim_types?.join(', ') || 'N/A'}
                        </Typography>
                        <Divider />

                        <Typography>
                          Fact-checking Strategies:{' '}
                          {evaluation.fact_checking_strategies?.join(', ') ||
                            'N/A'}
                        </Typography>

                        {/* Display questions and answers if available */}
                        {evaluation.questions &&
                          evaluation.questions.length > 0 && (
                            <>
                              <Divider />

                              <Typography variant="h6" sx={{ mt: 2 }}>
                                Questions & Answers:
                              </Typography>
                              <Divider />

                              {evaluation.questions.map(
                                (questionData: any, questionIndex: number) => (
                                  <Box key={questionIndex} sx={{ ml: 2 }}>
                                    <Typography>
                                      Question: {questionData.question}
                                    </Typography>
                                    {questionData.answers.map(
                                      (
                                        answerData: any,
                                        answerIndex: number
                                      ) => (
                                        <Box key={answerIndex} sx={{ ml: 4 }}>
                                          <Typography>
                                            Answer: {answerData.answer}
                                          </Typography>
                                          <Typography>
                                            Answer Type:{' '}
                                            {answerData.answer_type}
                                          </Typography>
                                          <Typography>
                                            Source URL:{' '}
                                            {answerData.source_url || 'N/A'}
                                          </Typography>
                                          <Typography>
                                            Cached Source URL:{' '}
                                            {answerData.cached_source_url ||
                                              'N/A'}
                                          </Typography>
                                          <Typography>
                                            Source Medium:{' '}
                                            {answerData.source_medium || 'N/A'}
                                          </Typography>
                                          <Divider />
                                        </Box>
                                      )
                                    )}
                                  </Box>
                                )
                              )}
                            </>
                          )}
                      </>
                    )}
                  </Collapse>
                </Box>
              );
            })}

            {!isEditing && (
              <Button
                sx={{ marginTop: 10, marginBottom: 20, margin: 'auto' }}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}

            {isEditing && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        )}
      </Stack>
    );
  } else {
    return (
      <Stack
        spacing={10}
        direction="column"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ProjectProgressBar step={4} stepProps={{}} />
        <Button
          variant="contained"
          color="success"
          onClick={handleGenerateEvaluation}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate AI Evaluation for Claims'}
        </Button>
        <TextField
          sx={{ mt: 5 }}
          label="Filter Facts by Claim Index"
          type="number"
          value={selectedClaimIndex}
          onChange={handleIndexChange}
          error={
            selectedClaimIndex < -1 ||
            selectedClaimIndex >= (projectData.claims?.length || 0)
          }
          helperText={
            selectedClaimIndex < -1 ||
            selectedClaimIndex >= (projectData.claims?.length || 0)
              ? 'Invalid claim index'
              : ''
          }
        />
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <ClaimsList claims={projectData.claims || []} />
          <FactsList
            claims={projectData.claims}
            selectedClaimIndex={selectedClaimIndex}
            factsFinal={projectData.facts}
          />
        </Stack>
      </Stack>
    );
  }
}

function saveClaimsToFireStore(
  claimEvaluations: any,
  projectId: number,
  userId: string
) {
  try {
    for (let i = 0; i < claimEvaluations.length; i++) {
      claimEvaluations[i].claim_id = i;
      const reference: any = collection(db, 'claims');
      const result = addDoc(reference, claimEvaluations[i]);
    }
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

async function saveArticleEvaluationToFireStore(
  article: any,
  projectId: number,
  userId: string
) {
  try {
    // Add project ID and user ID to the article evaluation data
    //articleEvaluation.projectId = projectId;
    //articleEvaluation.userId = userId;

    // Reference the 'articleEvaluations' collection in Firestore
    const reference: any = collection(db, 'articles');

    // Add the article evaluation data to Firestore
    const result = await addDoc(reference, article);

    console.log('Article evaluation saved to Firestore with ID:', result.id);
    // alert('Article evaluation saved to Firestore with ID: ' + result.id);
  } catch (error) {
    console.error('Error saving article evaluation:', error);
    throw error;
  }
}
