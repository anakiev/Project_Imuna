import React, { useState } from 'react';
import Box from '@mui/material/Box';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  signInWithEmailAndPassword,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/auth/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type formFields = {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleChangeEmail: (
    event: React.ChangeEvent<HTMLInputElement>,
    setEmail: (email: string) => void
  ) => void;
  handleChangePass: (
    event: React.ChangeEvent<HTMLInputElement>,
    setEmail: (password: string) => void
  ) => void;
  loginError: string;
  setloginError: (setloginError: string) => void;
};

export default function SignInForm() {
  const [signInState, setSignInState] = React.useState('start');

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setloginError] = React.useState('');

  const handleChangeEmail = (
    event: React.ChangeEvent<HTMLInputElement>,
    setEmail: formFields['setEmail']
  ) => {
    setEmail(event.target.value);
  };
  const handleChangePass = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPassword: formFields['setEmail']
  ) => {
    setPassword(event.target.value);
  };

  const formFields: formFields = {
    email,
    password,
    setEmail,
    setPassword,
    handleChangeEmail,
    handleChangePass,
    loginError,
    setloginError,
  };

  return <>{renderOptions(signInState, setSignInState, formFields)}</>;
}

const handleSignInWithGoogle = (event: any) => {
  event.preventDefault();
  signInWithGoogle();
};

const handleSignInWithEmail =
  (
    email: string,
    password: string,
    setloginError: formFields['setloginError']
  ) =>
  (event: any) => {
    event.preventDefault();
    signInWithEmailAndPassword(email, password, setloginError);
  };

const handleSignUpWithEmail =
  (
    email: string,
    password: string,
    setloginError: formFields['setloginError']
  ) =>
  (event: any) => {
    event.preventDefault();
    signUpWithEmail(email, password, setloginError);
  };

const renderOptions = (
  signInState: string,
  setSignInState: any,
  formFields: formFields
) => {
  switch (signInState) {
    case 'start':
      return (
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => setSignInState('email')}>
            Sign In with Email
          </Button>
          <Button variant="contained" onClick={() => setSignInState('signUp')}>
            Sign Up with Email
          </Button>
          <Button variant="contained" onClick={handleSignInWithGoogle}>
            Sign In with Google
          </Button>
        </Stack>
      );
    case 'email':
      return (
        <Stack>
          <Container>
            <IconButton
              aria-label="back"
              size="small"
              onClick={() => {
                setSignInState('start');
                formFields.setEmail('');
                formFields.setPassword('');
                formFields.setloginError('');
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Container>
          <SignInEmail formFields={formFields} />
        </Stack>
      );
    case 'signUp':
      return (
        <Stack>
          <Container>
            <IconButton
              aria-label="back"
              size="small"
              onClick={() => setSignInState('start')}
            >
              <ArrowBackIcon />
            </IconButton>
          </Container>
          <SignUpEmail formFields={formFields} />
        </Stack>
      );
  }
};

const SignInEmail = ({ formFields }: { formFields: formFields }) => {
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    formFields.setEmail(event.target.value);
  };
  const handleChangePass = (event: React.ChangeEvent<HTMLInputElement>) => {
    formFields.setPassword(event.target.value);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSignInWithEmail(
        formFields.email,
        formFields.password,
        formFields.setloginError
      );
    }
  };

  return (
    <Stack
      direction="column"
      justifyContent="space-around"
      alignItems="center"
      spacing={2}
    >
      <TextField
        id="outlined-basic"
        label="Email"
        variant="outlined"
        onChange={handleChangeEmail}
        onKeyDown={handleKeyDown}
      />
      <TextField
        type="password"
        id="outlined-basic"
        label="Password"
        variant="outlined"
        onChange={handleChangePass} // update the state on change
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={handleSignInWithEmail(
          formFields.email,
          formFields.password,
          formFields.setloginError
        )}
      >
        Sign In
      </Button>

      {formFields.loginError != '' && (
        <Alert severity="error">Error loggin in. {formFields.loginError}</Alert>
      )}
      <Typography variant="h4">OR</Typography>
      <Button onClick={handleSignInWithGoogle}>Sign In with Google</Button>
    </Stack>
  );
};

const SignUpEmail = ({ formFields }: { formFields: formFields }) => {
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    formFields.setEmail(event.target.value);
  };
  const handleChangePass = (event: React.ChangeEvent<HTMLInputElement>) => {
    formFields.setPassword(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      signUpWithEmail(
        formFields.email,
        formFields.password,
        formFields.setloginError
      );
    }
  };
  return (
    <Stack
      direction="column"
      justifyContent="space-around"
      alignItems="center"
      spacing={2}
    >
      <TextField
        id="outlined-basic"
        label="Email"
        variant="outlined"
        onChange={handleChangeEmail}
        onKeyDown={handleKeyDown}
      />
      <TextField
        type="password"
        id="outlined-basic"
        label="Password"
        variant="outlined"
        onChange={handleChangePass} // update the state on change
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={handleSignUpWithEmail(
          formFields.email,
          formFields.password,
          formFields.setloginError
        )}
      >
        Sign Up
      </Button>
      {formFields.loginError != '' && (
        <Alert severity="error">
          Error signing up. {formFields.loginError}
        </Alert>
      )}
      <Typography variant="h4">OR</Typography>
      <Button onClick={handleSignInWithGoogle}>Sign In with Google</Button>
    </Stack>
  );
};
