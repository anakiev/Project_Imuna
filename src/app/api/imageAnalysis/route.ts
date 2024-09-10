import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/files';
import { error } from 'console';
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Replace with your actual Gemini API key
let apiKey: string = '';
if (process.env.GEMINI_API_KEY)
    apiKey = process.env.GEMINI_API_KEY
else
    error('API key not found');

const genAI = new GoogleGenerativeAI(apiKey);

// Model configuration for image analysis
const imageModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or the appropriate model

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 15000,
    responseMimeType: 'application/json',
};

// Safety settings (you can adjust these as needed)
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

async function downloadAndSaveImage(imageUrl: string): Promise<string | null> {
    try {
        const response: any = await new Promise((resolve, reject) => {
            https.get(imageUrl, (res) => {
                if (res.statusCode === 200) {
                    resolve(res);
                } else {
                    reject(new Error(`Failed to fetch image: ${res.statusCode} ${res.statusMessage}`));
                }
            }).on('error', (err) => {
                reject(err);
            });
        });

        const contentType = response.headers['content-type'];
        const fileExtension = contentType.includes('jpeg') ? '.jpg' :
            contentType.includes('png') ? '.png' : '';

        if (!fileExtension) {
            throw new Error('Unsupported image format');
        }

        const filename = `image_${Date.now()}${fileExtension}`;
        const filePath = path.join(process.cwd(), 'public', filename); 

        // Use fs.createWriteStream for efficient piping
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);

        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        return filePath; 
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            console.error(`Error downloading image: Connection refused to ${imageUrl}. Please check the URL and network connectivity.`);
        } else {
            console.error('Error downloading and saving image:', error); 
        }
        return null;
    }
}

async function analyzeImage(imageUrl: string, articleTitle: string, articleBody: string) {
    const savedImagePath = await downloadAndSaveImage(imageUrl);
    if (!savedImagePath) {
        throw new Error("Failed to download and save image");
    }

    const fileManager = new GoogleAIFileManager(apiKey);

    const uploadResult = await fileManager.uploadFile(
        savedImagePath,
        {
            mimeType: "image/jpeg", // Adjust if needed based on the actual image type
            displayName: "Image for analysis",
        },
    );

    console.log(
        `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
    );

    const imagePrompt = `Analyze the following image and provide a detailed description, considering the context of the article titled "${articleTitle}" with the following body text: "${articleBody}"`

    try {
        const result = await imageModel.generateContent([
            imagePrompt,
            {
                fileData: {
                    fileUri: uploadResult.file.uri, // Use the uploaded image URI
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        console.log(result.response.text());
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        console.log(body)
        // Extract image URL, article title, and article body from the request body
        const { imageUrl, articleTitle, articleBody } = body;

        // Validate input
        if (!imageUrl || !articleTitle || !articleBody) {
            return NextResponse.json({ error: "Missing required data" }, { status: 400 });
        }

        const analysisResult = await analyzeImage(imageUrl, articleTitle, articleBody);

        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error("Error in POST handler:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: any) {
    return NextResponse.json(
        { message: 'Hello!' },
        {
            status: 200,
        },
    );
}