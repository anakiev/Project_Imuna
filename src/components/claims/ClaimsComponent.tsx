import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import { auth, db } from '@/lib/auth/clientApp';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { getMyProfile } from '../fetchData/getMyProfile';
import LoadingButton from '@mui/lab/LoadingButton';
import { title } from 'process';

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

const ImageContextPopup = ({
  images,
  articleText,
  articleTitle,
  open,
  onClose,
  onImportContext,
}: // imageDialogOpen
any) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedContext, setExtractedContext] = useState('');
  // const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/imageAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: images,
          articleTitle: articleTitle,
          articleBody: articleText,
        }),
      });
      const res = await response;
      try {
        const data = await res.json();
        if (data.context) setExtractedContext(data.context);
      } catch (error) {
        console.error('Error analyzing images:', error);
        setExtractedContext(''); // Clear the context if there's an error
      } finally {
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error analyzing images:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImportContext = () => {
    onImportContext(extractedContext);
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Extract Context from Images</DialogTitle>
      <DialogContent>
        <LoadingButton
          loading={isAnalyzing}
          loadingPosition="start"
          startIcon={<AutorenewIcon />}
          variant="outlined"
          onClick={handleStartAnalysis}
        >
          Start Analysis
        </LoadingButton>
        {extractedContext && (
          <Box mt={2}>
            <Typography variant="body1">{extractedContext}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleImportContext} disabled={!extractedContext}>
          Import Context
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ClaimExtractor = ({
  data,
  projectId,
  userId,
}: {
  data: any;
  projectId: number;
  userId: string | undefined;
}) => {
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [editingClaimIndex, setEditingClaimIndex] = useState<number | null>(
    null
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [newClaim, setNewClaim] = useState<ClaimData>({
    claim: '',
    claim_date: moment().format('YYYY-MM-DD'),
    speaker: '',
    original_claim_url: '',
    cached_original_claim_url: '',
    reporting_source: '',
    location_ISO_code: '',
    source_medium: '',
    claim_types: [],
  });

  const [isImageContextPopupOpen, setIsImageContextPopupOpen] = useState(false);

  const handleOpenImageContextPopup = () => {
    setIsImageContextPopupOpen(true);
  };

  const handleCloseImageContextPopup = () => {
    setIsImageContextPopupOpen(false);
  };

  const handleImportImageContext = (context: string) => {
    // Append the extracted context to the article body text
    // You'll need to implement the actual update logic here
    console.log('Importing context:', context);
  };

  const handleExtractClaims = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/extractClaims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: data.article_text,
          title: data.title,
          images: data.images,
        }),
      });
      const data2 = await response.json();
      setClaims(data2.claims);
      console.log('Extracted claims:', data2.claims);
    } catch (error) {
      console.error('Error extracting claims:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEditClaim = (index: number) => {
    setEditingClaimIndex(index);
  };

  const handleSaveClaim = (index: number) => {
    setEditingClaimIndex(null);
  };

  const handleClaimChange = (
    index: number,
    field: keyof ClaimData,
    value: string
  ) => {
    setClaims((prevClaims) =>
      prevClaims.map((claim, i) =>
        i === index ? { ...claim, [field]: value } : claim
      )
    );
  };

  const handleDeleteClaim = (index: number) => {
    setClaims((prevClaims) => prevClaims.filter((_, i) => i !== index));
  };

  const handleSaveToFirestore = async () => {
    try {
      const firestoreClaims = claims.map((claim) => ({
        ...claim,
      }));

      await saveToFirestore(firestoreClaims, projectId, userId);
      alert('Claims saved to Firestore!');
      console.log('Claims saved to Firestore!');
    } catch (error) {
      console.error('Error saving claims to Firestore:', error);
    }
  };

  const handleAddClaimManually = () => {
    setIsAddingClaim(true);
  };

  const handleCloseAddClaimDialog = () => {
    setIsAddingClaim(false);
    setNewClaim({
      claim: '',
      claim_date: moment().format('YYYY-MM-DD'),
      speaker: '',
      original_claim_url: '',
      cached_original_claim_url: '',
      reporting_source: '',
      location_ISO_code: '',
      source_medium: '',
      claim_types: [],
    });
  };

  const handleAddNewClaim = () => {
    setClaims([...claims, newClaim]);
    handleCloseAddClaimDialog();
  };

  const handleNewClaimChange = (field: keyof ClaimData, value: string) => {
    if (field === 'claim_types') {
      setNewClaim({ ...newClaim, [field]: value.split(',') });
      return;
    }
    setNewClaim({ ...newClaim, [field]: value });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Button
        variant="outlined"
        onClick={handleOpenImageContextPopup}
        sx={{ ml: 2 }}
      >
        Extract Context from Images
      </Button>
      <LoadingButton
        loading={isExtracting}
        loadingPosition="start"
        startIcon={<AutorenewIcon />}
        variant="outlined"
        onClick={handleExtractClaims}
      >
        Extract Claims
      </LoadingButton>

      <Button
        variant="contained"
        color="success"
        onClick={handleSaveToFirestore}
        sx={{ ml: 2 }}
        disabled={claims.length === 0}
      >
        Persist Claims
      </Button>

      <Button
        variant="outlined"
        color="primary"
        onClick={handleAddClaimManually}
        sx={{ ml: 2 }}
      >
        Add Claim Manually
      </Button>

      <Box sx={{ mt: 4 }}>
        {claims.map((claim, index) => (
          <Card variant="outlined" sx={{ maxWidth: 450, mb: 2 }} key={index}>
            <Box sx={{ p: 2 }}>
              <Stack direction="column" spacing={1}>
                <Typography variant="h6">{`Claim ${index + 1}`}</Typography>

                {editingClaimIndex === index ? (
                  <>
                    {/* Editing mode with TextFields */}
                    <TextField
                      label="Claim"
                      value={claim.claim}
                      onChange={(e) =>
                        handleClaimChange(index, 'claim', e.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Claim Date"
                      value={claim.claim_date}
                      onChange={(e) =>
                        handleClaimChange(index, 'claim_date', e.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Speaker"
                      value={claim.speaker}
                      onChange={(e) =>
                        handleClaimChange(index, 'speaker', e.target.value)
                      }
                      fullWidth
                    />
                    <TextField
                      label="Original Claim URL"
                      value={claim.original_claim_url || ''}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'original_claim_url',
                          e.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Cached Claim URL"
                      value={claim.cached_original_claim_url || ''}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'cached_original_claim_url',
                          e.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Reporting Source"
                      value={claim.reporting_source}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'reporting_source',
                          e.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Location ISO Code"
                      value={claim.location_ISO_code}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'location_ISO_code',
                          e.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Source Medium"
                      value={claim.source_medium}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'source_medium',
                          e.target.value
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Claim Types (comma-separated)"
                      value={claim.claim_types.join(', ')}
                      onChange={(e) =>
                        handleClaimChange(
                          index,
                          'claim_types',
                          e.target.value.split(', ').join(',')
                        )
                      }
                      fullWidth
                    />
                    <Button onClick={() => handleSaveClaim(index)}>Save</Button>
                  </>
                ) : (
                  <>
                    {/* Display all fields even when not editing */}
                    <Typography color="text.secondary">
                      Claim: {claim.claim}
                    </Typography>
                    <Typography color="text.secondary">
                      Claim Date:{' '}
                      {moment(claim.claim_date).format('MMMM D, YYYY')}
                    </Typography>
                    <Typography color="text.secondary">
                      Speaker: {claim.speaker}
                    </Typography>
                    {claim.original_claim_url && (
                      <Typography color="text.secondary">
                        Original URL:{' '}
                        <a
                          href={claim.original_claim_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {claim.original_claim_url}
                        </a>
                      </Typography>
                    )}
                    <Typography color="text.secondary">
                      Cached Original Claim URL:{' '}
                      {claim.cached_original_claim_url || 'N/A'}
                    </Typography>
                    <Typography color="text.secondary">
                      Reporting Source: {claim.reporting_source}
                    </Typography>
                    <Typography color="text.secondary">
                      Location ISO Code: {claim.location_ISO_code}
                    </Typography>
                    <Typography color="text.secondary">
                      Source Medium: {claim.source_medium}
                    </Typography>

                    <Button onClick={() => handleEditClaim(index)}>Edit</Button>
                  </>
                )}

                <Stack direction="row" spacing={1}>
                  {claim.claim_types.map((type) => (
                    <Chip
                      label={type}
                      variant="outlined"
                      size="small"
                      key={type}
                    />
                  ))}
                </Stack>

                <IconButton
                  aria-label="Delete image"
                  onClick={() => handleDeleteClaim(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Dialog for adding a new claim */}
      <Dialog open={isAddingClaim} onClose={handleCloseAddClaimDialog}>
        <DialogTitle>Add New Claim</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Claim"
              value={newClaim.claim}
              onChange={(e) => handleNewClaimChange('claim', e.target.value)}
              fullWidth
            />
            {/* ... other TextFields for newClaim fields ... */}
            <TextField
              label="Claim Date"
              type="date" // Use date input for better UX
              value={newClaim.claim_date}
              onChange={(e) =>
                handleNewClaimChange('claim_date', e.target.value)
              }
              fullWidth
              InputLabelProps={{
                shrink: true, // Ensure the label is always visible
              }}
            />
            <TextField
              label="Speaker"
              value={newClaim.speaker}
              onChange={(e) => handleNewClaimChange('speaker', e.target.value)}
              fullWidth
            />
            <TextField
              label="Original Claim URL"
              value={newClaim.original_claim_url}
              onChange={(e) =>
                handleNewClaimChange('original_claim_url', e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Cached Claim URL"
              value={newClaim.cached_original_claim_url}
              onChange={(e) =>
                handleNewClaimChange(
                  'cached_original_claim_url',
                  e.target.value
                )
              }
              fullWidth
            />
            <TextField
              label="Reporting Source"
              value={newClaim.reporting_source}
              onChange={(e) =>
                handleNewClaimChange('reporting_source', e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Location ISO Code"
              value={newClaim.location_ISO_code}
              onChange={(e) =>
                handleNewClaimChange('location_ISO_code', e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Source Medium"
              value={newClaim.source_medium}
              onChange={(e) =>
                handleNewClaimChange('source_medium', e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Claim Types (comma-separated)"
              value={newClaim.claim_types}
              onChange={(e) =>
                handleNewClaimChange(
                  'claim_types',
                  e.target.value.split(', ').join(',')
                )
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddClaimDialog}>Cancel</Button>
          <Button onClick={handleAddNewClaim} disabled={!newClaim.claim}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <ImageContextPopup
        images={data.images}
        articleText={data.article_text}
        articleTitle={data.title}
        open={isImageContextPopupOpen}
        onClose={handleCloseImageContextPopup}
        onImportContext={handleImportImageContext}
      />
    </Box>
  );
};

// ... (saveToFirestore function)
export async function saveToFirestore(
  claims: ClaimData[],
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
    profile.projects[projectId].claims = claims;
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

export default ClaimExtractor;
