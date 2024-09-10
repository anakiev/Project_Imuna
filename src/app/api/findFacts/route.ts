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
     You are an automated fact-checking system tasked with analyzing real-world claims and gathering evidence to determine their veracity. Your job is to retrieve reputable sources from the web and provide answers to fact-checking questions for each claim independently. Be extremely thorough with your online search, ensuring all facts are backed by reliable sources. Each fact must be validated before providing an answer.
     
     Given the following information about a claim:
     
     {
       "claim": "{{claim}}",
       "claim_date": "{{claim_date}}",
       "speaker": "{{speaker}}",
       "original_claim_url": "{{original_claim_url}}",
       "cached_original_claim_url": "{{cached_original_claim_url}}",
       "reporting_source": "{{reporting_source}}",
       "location_ISO_code": "{{location_ISO_code}}",
       "source_medium": "{{source_medium}}",
       "claim_types": ["{{claim_types}}"]
     }
     
     Task:
     
     1. **Fact-checking Strategy:**
        - Use web searches to gather reliable and credible evidence from sources like news outlets, government sites, research publications, or well-established fact-checking organizations.
        - Ensure that all sources are from before the claim date to avoid future knowledge leaks.
        - Record both the source URLs and archive links (from services like archive.org).
     
     2. **Output Structure:**
        Make sure every fact you've found is represented in the following format:
     "facts": [
         {
           "claimIndex": "The index of the claim that is related to this question and answer pair",
           "question": "{{question_1}}",
           "answers": [
             {
               "answer": "{{answer_1}}",
               "answer_type": "{{answer_type_1}}",
               "source_url": "{{source_url_1}}",
               "cached_source_url": "{{cached_source_url_1}}",
               "source_medium": "{{source_medium_1}}"
             }
           ]
         },
         ... // More questions and answers
      ]
     
     3. **Questions & Answers:**
        - For each claim, generate fact-checking questions relevant to verifying its accuracy.
        - For each question, find an answer by identifying relevant portions of the evidence you have collected.
        - Categorize the answers as "abstractive," "extractive," "boolean," or "unanswerable."
        - Ensure that all answers are backed by sources with both direct and archived URLs.

     
     Make sure to check facts for every claim **independently** and conduct a thorough search for evidence related to each one.
     Here's a list of websites you can use to find reliable sources:
      Google Fact Check Explorer
      Wikipedia
      You can also use Google Search to find relevant information.
      These websites are known for fact-checking and debunking misinformation:
      - [Snopes](https://www.snopes.com/)
      - [FactCheck.org](https://www.factcheck.org/)
      - [PolitiFact](https://www.politifact.com/)
      - [BBC Reality Check](https://www.bbc.com/news/reality_check)
      - [AP Fact Check](https://apnews.com/apfactcheck)
      - [Washington Post Fact Checker](https://www.washingtonpost.com/news/fact-checker/)
      - [The Conversation Fact Check](https://theconversation.com/us)
      - [Full Fact](https://fullfact.org/)
      - [Check Your Fact](https://checkyourfact.com/)
      - [Lead Stories](https://leadstories.com/)
      - [AFP Fact Check](https://factcheck.afp.com/)
      - [Health Feedback](https://healthfeedback.org/)
      - [Science Feedback](https://sciencefeedback.co/)
      - [Climate Feedback](https://climatefeedback.org/)
      - [Media Bias/Fact Check](https://mediabiasfactcheck.com/)
      - [International Fact-Checking Network](https://www.poynter.org/ifcn/)
      - [FactCheckNI](https://factcheckni.org/)
      - [Africa Check](https://africacheck.org/)
      - [Chequeado](https://chequeado.com/)
      - [El Polígrafo](https://www.elpoligrafo.com/)
      - [FactCheckEU](https://factcheckeu.info/)
      - [FactsCan](https://factscan.ca/)
      - [Hoax-Slayer](https://www.hoax-slayer.net/)
      - [TruthOrFiction](https://www.truthorfiction.com/)
      - [European Union vs Disinformation](https://euvsdisinfo.eu/)
      Make sure you search these websites for relevant information to verify the claims.
      You can also use Google Search to find relevant information.
      Do not stop searching even if you find a few sources. The more sources you find, the better.
      You may categorize the answer as unanswerable if you cannot find any relevant information to verify or debunk the claim from all the sources listed above.
     `
    });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 15000,
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
  