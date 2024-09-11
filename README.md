# IMuNA

<img src="https://raw.githubusercontent.com/anakiev/Project_Imuna/main/src/app/icon.png" width="240" height="240">


IMuNA is an application designed to assist with human-AI fact-checking. The app streamlines the fact-checking process by analyzing claims and generating AI-based evaluations. It provides an interactive workflow for users to extract, identify, and evaluate facts from their data.

## Features

- **Claim Extraction**: Automatically extract claims from input data.
- **Fact Identification**: Identify facts related to extracted claims.
- **AI-Powered Evaluation**: Generate AI-driven evaluations for the identified claims.
- **Report Generation**: Save evaluations and generate comprehensive article reports.

## Prerequisites

Before running the application, ensure that your environment variables are correctly configured.

### Environment Variables

For local development, create a .env.local file and populate it with the following values:

    GEMINI_API_KEY=YOUR_KEY
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    MESUREMENTID=YOUR_MEASUREMENTID

When deploying in a Docker environment, ensure the variables are in `env.production`, or the app will not function correctly.

## Getting Started

Follow these steps to run the project **locally**:

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Ensure your environment variables are set as described above.
4.  Start the project: `npm run dev`

For Docker environments follow these instructions:

Ensure you have your `env.production` file set up before building and
running the container.

1.  Build your image: `docker build -t nextjs-docker .`
2.  Ran your image: `docker run -p 3000:3000 nextjs-docker`

## Project Flow

Here is the normal flow for using the IMuNA app:

1.  **New Project**: Start a new project.
2.  **Input Data**: Provide the data you want to fact-check.
3.  **Extract Claims**: Extract claims (this may take up to 30 seconds).
4.  **Persist Claims**: Save the extracted claims.
5.  **Identify Facts**: Identify facts (this may take up to 60 seconds).
6.  **Persist Data**: Save the identified facts.
7.  **Generate AI Evaluation**: The AI will evaluate the claims (this may take up to 60 seconds).
8.  **Save Evaluation**: Save the AI evaluation to the database and generate a report.
