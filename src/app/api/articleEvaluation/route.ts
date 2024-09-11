import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from '@google/generative-ai';
  import { NextResponse, NextRequest } from 'next/server';
  import { error } from 'console';


  let apiKey:string = '';
  if(process.env.GEMINI_API_KEY) 
    apiKey = process.env.GEMINI_API_KEY 
  else 
    error('API key not found');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction:
     // 'You are provided with claims a news article is making in the following format: { claims: [\n{\nclaim: "claim",\nsentecefromListPosition: 0,\n}\n ] } , and you are asked to find facts that support or refute the claims. Use the following json format for output: { claims: [\n{\nclaim: "claim",\nsentecefromListPosition: 0,\n}\n ],\nfacts: [\n{\nfact: "fact",\nclaimfromListPosition: 0,\n,"source": "source"},\n,"URLsource": "URLsource"}\n ]\n}',
    `
     You are an automated fact-checking system tasked with analyzing real-world claims to determine their veracity using the available evidence. 
        You are given the following information about an Article:

        {
        articleTitle: "The title of the article",
        articleText: "The text of the article",
    claim_eval: [
        {
    "claim": "The claim text itself",
    "label": "The annotated verdict for the claim",
    "justification": "A textual justification explaining how the verdict was reached from the question-answer pairs.",
    "claim_date": "Our best estimate for the date the claim first appeared",
    "speaker": "The person or organization that made the claim, e.g. Barrack Obama, The Onion.",
    "original_claim_url": "If the claim first appeared on the internet, a url to the original location",
    "cached_original_claim_url": "Where possible, an archive.org link to the original claim url",
    "fact_checking_article": "The fact-checking article we extracted the claim from",
    "reporting_source": "The website or organization that first published the claim, e.g. Facebook, CNN.",
    "location_ISO_code": "The location most relevant for the claim. Highly useful for search.",
    "claim_types": [
            "The types of the claim",
    ],
    "fact_checking_strategies": [
        "The strategies employed in the fact-checking article",
    ],
    "questions": [
        {
            "question": "A fact-checking question for the claim",
            "answers": [
                {
                    "answer": "The answer to the question",
                    "answer_type": "Whether the answer was abstractive, extractive, boolean, or unanswerable",
                    "source_url": "The source url for the answer",
                    "cached_source_url": "An archive.org link for the source url"
                    "source_medium": "The medium the answer appeared in, e.g. web text, a pdf, or an image.",
                }
            ]
        },
},
.// other claims...
        ]
}

    Notes about Justification and Verdict Labeling:
    **Justification:**
   - Provide a detailed textual justification that explains the verdict for the veracity of the article based on the evidence for each claim and its question-answer pairs in the claim_eval array.
   - If conflicting evidence exists, be sure to explain why certain evidence supports or refutes the veracity of the article.

    **Verdict Labeling:**
   - Label the article as "Contains Misinformation" "Fact-checked," "Conflicting Evidence" or "Not Enough Evidence."
   - Ensure that your verdict aligns with the provided justification.

   Output:

   article: {
   verdict: "The verdict for the article",
   justification: "The justification for the verdict"
   }
     `
    });
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 50000,
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
  
  async function run(claims: any) {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });
  
    const result = await chatSession.sendMessage(JSON.stringify(claims));
    return result.response.text();
  }
  export async function POST(req: NextRequest, res: NextResponse) {
    const body = await req.json();
    // console.log(body);
    let text = '';
    try {
      text = await run(body.claims);
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
  