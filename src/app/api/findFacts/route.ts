import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from '@google/generative-ai';
  import { NextResponse, NextRequest } from 'next/server';
  import { error } from 'console';
  import { getAuthenticatedAppForUser } from '@/lib/auth/serverApp';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';

  let apiKey:string = '';
  if(process.env.GEMINI_API_KEY) 
    apiKey = process.env.GEMINI_API_KEY 
  else 
    error('API key not found');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const claimsProm = async () => {
    const { firebaseServerApp } = await getAuthenticatedAppForUser();
    const q = query(
      collection(getFirestore(firebaseServerApp), "claims"),
      orderBy("claim_date", "desc")
    );
    const results = await getDocs(q);
    return results.docs.map(doc => {
      return {
        ...doc.data(),
      };
    });
  }

     // 'You are provided with claims a news article is making in the following format: { claims: [\n{\nclaim: "claim",\nsentecefromListPosition: 0,\n}\n ] } , and you are asked to find facts that support or refute the claims. Use the following json format for output: { claims: [\n{\nclaim: "claim",\nsentecefromListPosition: 0,\n}\n ],\nfacts: [\n{\nfact: "fact",\nclaimfromListPosition: 0,\n,"source": "source"},\n,"URLsource": "URLsource"}\n ]\n}',
    const systemInstruct =`
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
        - Verify the credibility of the sources and cross-reference information to ensure accuracy.

  
     2. **Questions & Answers:**
     Follow the steps below for each claim:
        1. Construct fact-checking questions relevant to verifying the claims accuracy and veracity which can be used to verify or debunk the claim.
        2. For each question, find an answers by identifying relevant portions of the evidence you have collected. You will be instructed on evidence collection in the next section.
        3. Categorize the answers as "abstractive," "extractive," "boolean,", "insuficcient evidence" or "unanswerable."
        4. Ensure that all answers are backed by sources with both direct and archived URLs.
        5. If the news article doesn't provide the source of data, you must find the source of the data and provide the URL.
     
      Sources:
     Make sure to check facts for every claim **independently** and conduct a thorough search for evidence related to each one.
     Search the web for reliable sources that can verify or debunk the claims made in the article. If you do not find any relevant information from the first listed source, move on to the next one and so on.
     Here's a list of websites you can use to find reliable sources, feel free to use any other sources you find relevant:
        
      - Google Fact Check Explorer
      - Wikipedia
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
      - The first page of Google search results is usually the most relevant.
      Make sure you search these websites for relevant information to verify the claims.
      Do not stop searching even if you find a few sources. The more sources you find, the better.
      You may categorize the answer as unanswerable if you cannot find any relevant information to verify or debunk the claim from all the sources listed above.


      You are also provided with a list of pre-loaded verified claims that may be used to verify the claims in the article. Determine if some of of the verified claims  have relevance to the claims in the article and use them to cross-reference the information if relevant and appropriate.
      The following is an array of the verified claims which are structed in JSON for easier analysis: 
     `;

     const outputStruct = `
     \n
     **Output Structure:**

     After you have constructed the questions, gathered all the evidence and answered the questions, you must respond with a JSON object containing the following structure:
     
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
         {  
         // Other questions and answers
         }
         .
         .
         .
      ]

      **Notes:**
        "facts" is an array which contains question-answer relationships.
        Each claim may have multiple fact-checking questions and each question may have multiple answers.
        Be very detailed in your output and provide as much information as possible.
        Be precise and concise when filling in the fields.
        It is very important to have as many fields filled out as possible.
        If you leave a field empty, place a " " (string with once space) instead.
        each claim object in the array has a property "claimIndex" which is the index of the claim that is related to this question and answer pair.
        You will follow the instructions that have been provided to you very carefully.   
      `
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
    const verifiedClaims = await claimsProm();
    const sysPrompt = systemInstruct + JSON.stringify(verifiedClaims) + outputStruct
    // console.log(sysPrompt);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: sysPrompt,
    });
    model.systemInstruction
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
    //console.log(body);
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
  