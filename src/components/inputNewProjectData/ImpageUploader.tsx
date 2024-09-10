import React, { useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { storage } from '@/lib/auth/clientApp';
import { auth } from '@/lib/auth/clientApp';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
// Firebase configuration (replace with your own)
const firebaseConfig = {
  // ... your Firebase project configuration
};
function ImageUploader({ setMultimedia }: any) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const userId = auth.currentUser?.uid;
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const storageRef = ref(storage, `images/${userId}/${uuidv4()}`); // Customize path
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Error uploading image:', error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL); // Use the URL as needed
        setMultimedia((prev: any) => [
          ...prev,
          { type: 'image', url: downloadURL },
        ]);
      }
    );
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      <Button variant="contained" component="label">
        Choose File
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {selectedFile && (
        <Typography variant="body1">{selectedFile.name}</Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile}
      >
        Upload
      </Button>

      {uploadProgress > 0 && (
        <Typography variant="body1">
          Upload progress: {Math.round(uploadProgress)}%
        </Typography>
      )}
    </Box>
  );
}

export default ImageUploader;
