'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  TextField,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { auth, db } from '@/lib/auth/clientApp';
// import { extractProjectID } from './utils';
import { usePathname } from 'next/navigation';
import { getMyProfile } from '../fetchData/getMyProfile';
import { doc, updateDoc } from 'firebase/firestore';

function extractProjectID(str: string) {
  const regex = /\/projects\/([^\/]+)\/.*/;
  const match = str.match(regex);
  return match ? match[1] : '0';
}

interface ClaimData {
  claim: string;
  claim_date: string;
  speaker: string;
  original_claim_url?: string;
  cached_original_claim_url?: string;
  reporting_source: string;
  location_ISO_code: string;
  source_medium: string;
  claim_types: string[];
}

interface AnswerData {
  answer: string;
  answer_type: string;
  source_url: string;
  cached_source_url: string;
  source_medium: string;
}

interface FactData {
  claimIndex: number;
  question: string;
  answers: AnswerData[];
}

interface ApiResponse {
  facts: FactData[];
}

const FactsList = ({
  claims,
  selectedClaimIndex,
  factsFinal,
}: {
  claims: ClaimData[];
  selectedClaimIndex: number;
  factsFinal: FactData[] | null;
}) => {
  const [facts, setFacts] = useState<FactData[] | undefined>();
  const [editingFactIndex, setEditingFactIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswerData, setNewAnswerData] = useState<AnswerData>({
    answer: '',
    answer_type: '',
    source_url: '',
    cached_source_url: '',
    source_medium: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const projectId = extractProjectID(pathname);
  const userId = auth.currentUser?.uid || '';
  if (factsFinal && factsFinal.length > 0) {
    return (
      <Stack direction="column" spacing={2}>
        {factsFinal
          ?.filter((fact, index) => {
            if (selectedClaimIndex < 0) {
              return true;
            } else {
              return fact.claimIndex == selectedClaimIndex;
            }
          })

          .map((fact, index) => (
            <Card variant="outlined" sx={{ maxWidth: 650, mb: 2 }} key={index}>
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography gutterBottom variant="h6" component="div">
                    {`Fact ${index + 1}`}
                  </Typography>
                  <Divider />
                  <Stack direction="row" spacing={1}>
                    {editingFactIndex === index ? (
                      <IconButton
                        aria-label="Save fact"
                        onClick={() => handleSaveFact(index)}
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="Edit fact"
                        onClick={() => handleEditFact(index)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="Delete fact"
                      onClick={() => handleDeleteFact(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {editingFactIndex === index ? (
                  <>
                    <TextField
                      label="Question"
                      defaultValue={fact.question}
                      fullWidth
                      margin="normal"
                    />
                    <Divider />
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Question: {fact.question}
                    </Typography>

                    <Divider />
                  </>
                )}
                {fact.answers.map((answer: any, answerIndex: any) => (
                  <Box key={answerIndex} sx={{ mt: 1 }}>
                    {editingFactIndex === index ? (
                      <>
                        <TextField
                          label="Answer"
                          defaultValue={answer.answer}
                          fullWidth
                          margin="normal"
                        />
                        <Divider />

                        <TextField
                          label="Answer Type"
                          defaultValue={answer.answer_type}
                          fullWidth
                          margin="normal"
                        />
                        <Divider />

                        <TextField
                          label="Source"
                          defaultValue={answer.source_url}
                          fullWidth
                          margin="normal"
                        />
                        <Divider />

                        <TextField
                          label="Cached Source URL"
                          defaultValue={answer.cached_source_url}
                          fullWidth
                          margin="normal"
                        />
                        <Divider />

                        <TextField
                          label="Source Medium"
                          defaultValue={answer.source_medium}
                          fullWidth
                          margin="normal"
                        />
                        <Divider />
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          Answer: {answer.answer}
                        </Typography>
                        <Divider />

                        <Typography
                          variant="body2"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Answer Type: {answer.answer_type}
                        </Typography>
                        <Divider />

                        <Typography variant="body2">
                          Source: {answer.source_url}
                        </Typography>
                        <Divider />

                        <Typography variant="body2">
                          Cached Source URL: {answer.cached_source_url}
                        </Typography>
                        <Divider />

                        <Typography variant="body2">
                          Source Medium: {answer.source_medium}
                        </Typography>
                        <Divider />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
      </Stack>
    );
  }

  const handleFindFacts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/findFacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ claims }),
      });

      const data: ApiResponse = JSON.parse(await response.json());
      setFacts(data.facts);
      console.log('Facts:', data);
    } catch (error) {
      console.error('Error finding Facts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFact = (index: number) => {
    setEditingFactIndex(index);
  };

  const handleSaveFact = (index: number) => {
    setEditingFactIndex(null);
  };

  const handleDeleteFact = (index: number) => {
    setFacts((prevFacts) => {
      if (prevFacts) {
        const updatedFacts = [...prevFacts];
        updatedFacts.splice(index, 1);
        return updatedFacts;
      } else {
        return prevFacts;
      }
    });
  };

  const handleAddFact = () => {
    if (
      newQuestion &&
      newAnswerData.answer &&
      newAnswerData.answer_type &&
      newAnswerData.source_url
    ) {
      const newFact: FactData = {
        claimIndex: selectedClaimIndex,
        question: newQuestion,
        answers: [newAnswerData],
      };

      setFacts((prevFacts) =>
        prevFacts ? [...prevFacts, newFact] : [newFact]
      );

      setNewQuestion('');
      setNewAnswerData({
        answer: '',
        answer_type: '',
        source_url: '',
        cached_source_url: '',
        source_medium: '',
      });
    }
  };

  const handlePersistData = async () => {
    if (!facts || facts.length === 0) {
      console.error('No facts to persist.');
      return;
    }

    try {
      setIsLoading(true);
      await saveFactsToFireStore(facts, Number(projectId), userId);
      console.log('Facts persisted successfully!');
    } catch (error) {
      console.error('Error persisting facts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFindFacts}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Identify Facts'}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePersistData}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Persist Data'}
        </Button>
      </Stack>

      <Box sx={{ mt: 4 }}>
        {facts
          ?.filter((fact, index) => {
            if (selectedClaimIndex < 0) {
              return true;
            } else {
              console.log(fact.claimIndex, selectedClaimIndex);
              return fact.claimIndex == selectedClaimIndex;
            }
          })
          .map((fact, index) => (
            <Card variant="outlined" sx={{ maxWidth: 650, mb: 2 }} key={index}>
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography gutterBottom variant="h6" component="div">
                    {`Fact ${index + 1}`}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {editingFactIndex === index ? (
                      <IconButton
                        aria-label="Save fact"
                        onClick={() => handleSaveFact(index)}
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="Edit fact"
                        onClick={() => handleEditFact(index)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      aria-label="Delete fact"
                      onClick={() => handleDeleteFact(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                {editingFactIndex === index ? (
                  <TextField
                    label="Question"
                    defaultValue={fact.question}
                    fullWidth
                    margin="normal"
                  />
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Question: {fact.question}
                  </Typography>
                )}

                {fact.answers.map((answer: any, answerIndex: any) => (
                  <Box key={answerIndex} sx={{ mt: 1 }}>
                    {editingFactIndex === index ? (
                      <>
                        <TextField
                          label="Answer"
                          defaultValue={answer.answer}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Answer Type"
                          defaultValue={answer.answer_type}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Source"
                          defaultValue={answer.source_url}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Cached Source URL"
                          defaultValue={answer.cached_source_url}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Source Medium"
                          defaultValue={answer.source_medium}
                          fullWidth
                          margin="normal"
                        />
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          Answer: {answer.answer}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: 'italic' }}
                        >
                          Answer Type: {answer.answer_type}
                        </Typography>
                        <Typography variant="body2">
                          Source: {answer.source_url}
                        </Typography>
                        <Typography variant="body2">
                          Cached Source URL: {answer.cached_source_url}
                        </Typography>
                        <Typography variant="body2">
                          Source Medium: {answer.source_medium}
                        </Typography>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
      </Box>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Stack spacing={2}>
          <TextField
            label="Claim Index"
            value={selectedClaimIndex.toString()}
            fullWidth
          />
          <TextField
            label="New Question"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            fullWidth
          />

          <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Answer Details
            </Typography>
            <TextField
              label="Answer"
              value={newAnswerData.answer}
              onChange={(e) =>
                setNewAnswerData({ ...newAnswerData, answer: e.target.value })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Answer Type"
              value={newAnswerData.answer_type}
              onChange={(e) =>
                setNewAnswerData({
                  ...newAnswerData,
                  answer_type: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Source URL"
              value={newAnswerData.source_url}
              onChange={(e) =>
                setNewAnswerData({
                  ...newAnswerData,
                  source_url: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cached Source URL"
              value={newAnswerData.cached_source_url}
              onChange={(e) =>
                setNewAnswerData({
                  ...newAnswerData,
                  cached_source_url: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Source Medium"
              value={newAnswerData.source_medium}
              onChange={(e) =>
                setNewAnswerData({
                  ...newAnswerData,
                  source_medium: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddFact}
          >
            Add Fact
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default FactsList;

export async function saveFactsToFireStore(
  facts: FactData[],
  projectId: number,
  userId: string | undefined
) {
  try {
    const currentUser = auth.currentUser;
    let email = '';
    if (currentUser?.email) email = currentUser.email;
    else {
      console.error('No user found');
      return;
    }
    let userId = currentUser.uid; // Change this to the actual user ID //:TODO
    const fetchedProfiles = await getMyProfile(db, {});
    const profile = fetchedProfiles[0];
    profile.projects[projectId].facts = facts;
    const userDocRef = doc(db, 'users/' + userId);

    const result = await updateDoc(userDocRef, {
      projects: profile.projects,
    });
    console.log('New Article ID IS: ', result);
    console.log('New project created successfully!');
  } catch (error) {
    console.error('Error creating project:', error);
    throw error; // Optionally re-throw the error for handling elsewhere
  }
}
