import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  Collapse,
  Divider,
} from '@mui/material';
import moment from 'moment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ... (ClaimData interface)
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

const ClaimsList = ({ claims }: { claims: ClaimData[] }) => {
  const [expandedClaims, setExpandedClaims] = useState<number[]>([]);

  const handleExpandClick = (index: number) => {
    setExpandedClaims((prevExpanded) => {
      if (prevExpanded.includes(index)) {
        return prevExpanded.filter((item) => item !== index);
      } else {
        return [...prevExpanded, index];
      }
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mt: 4 }}>
        {claims.map((claim, index) => (
          <Card variant="outlined" sx={{ maxWidth: 450, mb: 2 }} key={index}>
            <Box sx={{ p: 2 }}>
              <Stack
                direction="column" // Changed to column to stack elements vertically
                spacing={2}
              >
                <Typography gutterBottom variant="h6" component="div">
                  {`Claim ${index + 1}`}
                </Typography>

                {/* Display the main claim */}
                <Typography variant="body1">{claim.claim}</Typography>
                <Divider />

                {/* Collapsible content for other claim details */}
                <Collapse
                  in={expandedClaims.includes(index)}
                  timeout="auto"
                  unmountOnExit
                >
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Claim Date:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {moment(claim.claim_date).format('MMMM D, YYYY')}
                      </span>
                    </Typography>
                    <Divider />

                    <Typography variant="body2">
                      Speaker:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.speaker}
                      </span>
                    </Typography>
                    <Divider />

                    {claim.original_claim_url && (
                      <>
                        <Typography variant="body2">
                          Original URL:{' '}
                          <a
                            href={claim.original_claim_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'text.secondary' }}
                          >
                            {claim.original_claim_url}
                          </a>
                        </Typography>
                        <Divider />
                      </>
                    )}
                    {/* ... Add more Typography components to display other fields as needed ... */}
                    <Typography variant="body2">
                      Cached Original Claim URL:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.cached_original_claim_url || 'N/A'}
                      </span>
                    </Typography>
                    <Divider />

                    <Typography variant="body2">
                      Reporting Source:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.reporting_source}
                      </span>
                    </Typography>
                    <Divider />

                    <Typography variant="body2">
                      Location ISO Code:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.location_ISO_code}
                      </span>
                    </Typography>
                    <Divider />

                    <Typography variant="body2">
                      Source Medium:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.source_medium}
                      </span>
                    </Typography>
                    <Divider />

                    <Typography variant="body2">
                      Claim Types:{' '}
                      <span style={{ color: 'text.secondary' }}>
                        {claim.claim_types.join(',')}
                      </span>
                    </Typography>
                    <Divider />
                  </Stack>
                </Collapse>

                {/* Expand button at the bottom */}
                <Button
                  onClick={() => handleExpandClick(index)}
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedClaims.includes(index)
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    />
                  }
                >
                  {expandedClaims.includes(index) ? 'Collapse' : 'Expand'}
                </Button>
              </Stack>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ClaimsList;
