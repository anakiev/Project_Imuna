// src/components/Footer.js

import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ backgroundColor: 'primary.dark', color: 'white', py: 2 }}>
      <Container>
        <Typography variant="body1" align="center" gutterBottom>
          &copy; {new Date().getFullYear()} IMuNA. All rights reserved.
        </Typography>
        <Box sx={{ justifyContent: 'center', mt: 2 }}>
          <Link href="/" color="inherit" sx={{ mx: 2 }}>
            Home
          </Link>
          <Link href="/about" color="inherit" sx={{ mx: 2 }}>
            About
          </Link>
          <Link href="/contact" color="inherit" sx={{ mx: 2 }}>
            Contact
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
