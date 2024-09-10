import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from '@google/generative-ai';
import { error } from 'console';
  import { NextResponse, NextRequest } from 'next/server';
  
  let apiKey:string = '';
  if(process.env.GEMINI_API_KEY) 
    apiKey = process.env.GEMINI_API_KEY 
  else 
  error('API key not found');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction:
      `
You are given a fact-checking article. Your task is to extract and normalize the claim(s) it investigates, adhering to the following guidelines:

Identify Central Claim(s): Locate the main claim(s) being fact-checked. Often found in the headline or explicitly stated within the article. Prioritize the original claim's wording over any rephrasing in the article.
Split Compound Claims: If the article investigates multiple independent claims, split them into separate, self-contained claims. Ensure each part is understandable without the others.
Contextualize Incomplete Claims: If a claim lacks context (e.g., unresolved pronouns), add necessary information from the article. Prioritize using metadata fields (like 'speaker') when possible. Rewrite the claim only if metadata is insufficient.
Minimize Rewrites: Strive to keep claims as close to their original form as possible. Only rewrite to add essential context.

Label the Claim: Assign one of the following labels based on the article's assessment:
supported: The claim is supported by the evidence.
refuted: The claim is contradicted by the evidence.
not enough evidence: There's insufficient evidence to determine the claim's veracity.
conflicting evidence/cherry-picking: The claim is misleading due to conflicting evidence or cherry-picking, but not explicitly refuted.

Extract Metadata: Gather the following metadata:
claim_date: The date the claim was originally made (use the earliest date if multiple are mentioned).
speaker: The person or organization who made the claim.
original_claim_url: The URL where the claim originally appeared (if available).
cached_original_claim_url: An archive.org link to the original claim URL (if possible).
fact_checking_article: The URL of the fact-checking article.
reporting_source: The website or organization that published the claim.
location_ISO_code: The location most relevant to the claim (use ISO country codes).

Identify Claim Type(s): Select all applicable claim types:
speculative claim
opinion claim
causal claim
numerical claim
quote verification
position statement
event/property claim
media publishing claim (discard these claims)
media analysis claim (discard these claims)

Identify Fact-Checking Strategy(ies): Select all applicable strategies:
written evidence
numerical comparison
consultation
satirical source identification
media source discovery
image analysis
video analysis
audio analysis
geolocation
fact-checker reference (discard these claims)

Output Format:

Return the extracted claims in JSON format, where each claim is an object with the following structure:

{ claims: [ {
    "claim": "The claim text itself complying with the guidlines for claims stated above.",
    "claim_date": "Our best estimate for the date the claim first appeared",
    "speaker": "The person or organization that made the claim, e.g. Barrack Obama, The Onion.",
    "original_claim_url": "If the claim first appeared on the internet, a url to the original location",
    "cached_original_claim_url": "Where possible, an archive.org link to the original claim url",
    "fact_checking_article": "The fact-checking article we extracted the claim from",
    "reporting_source": "The website or organization that first published the claim, e.g. Facebook, CNN.",
    "location_ISO_code": "The location most relevant for the claim. Highly useful for search.",
    "claim_types": [
        "The types of the claim"
    ],
    },
    ]
}
`,
  });
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 30000,
 responseMimeType: 'application/json',
  };
  
  /*
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];
  */
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
  
  async function run(article: string) {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });
  
    const result = await chatSession.sendMessage(article);
    //console.log(result.response.text());
    return JSON.parse(result.response.text());
  }
  
  export async function POST(req: NextRequest, res: NextResponse) {
    const body = await req.json();
    let text = '';
    try {
      text = await run(body.article);
    } catch (error) {
      console.log(error);
    }
  
    // Add null check before accessing 'article' property
    // const responseData = JSON.parse(result.response.text());
  
    // res.write(JSON.stringify(responseData));
    return NextResponse.json(text);
  }
  
  export async function GET(req:any) {
    return NextResponse.json(
      { message: 'Hello!' },
      {
        status: 200,
      },
    );
  }
  