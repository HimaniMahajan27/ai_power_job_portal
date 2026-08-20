const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (resumeText, jobDescription) => {
  try {
    // Try gemini-pro if gemini-1.5-flash doesn't work
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Truncate very long texts to avoid API limits
    const maxChars = 8000;
    const truncatedResume = resumeText.length > maxChars 
      ? resumeText.substring(0, maxChars) + '...' 
      : resumeText;
    const truncatedJob = jobDescription.length > maxChars 
      ? jobDescription.substring(0, maxChars) + '...' 
      : jobDescription;

    const prompt = `You are an expert ATS (Applicant Tracking System) and HR recruiter. Analyze the following resume against the job description and provide detailed, actionable feedback.

JOB DESCRIPTION:
${truncatedJob}

RESUME:
${truncatedResume}

Provide your analysis in the following JSON format (ONLY JSON, no other text):
{
  "overallMatch": <number 0-100>,
  "skillsMatch": {
    "matched": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"],
    "matchPercentage": <number 0-100>
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "feedback": "detailed feedback about experience relevance"
  },
  "keywordAnalysis": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "matchPercentage": <number 0-100>
  },
  "educationMatch": {
    "score": <number 0-100>,
    "feedback": "feedback about education alignment"
  },
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "improvements": [
    {
      "area": "Skills",
      "suggestion": "Add experience with X technology mentioned in job description",
      "priority": "high"
    },
    {
      "area": "Experience",
      "suggestion": "Quantify achievements with metrics",
      "priority": "medium"
    }
  ],
  "atsScore": <number 0-100>,
  "summary": "2-3 sentence summary of the match"
}

Be specific and actionable in your suggestions. Ensure strengths are positive and real, improvements are constructive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('=== Gemini API Error Details ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    console.error('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.error('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10));
    console.error('===============================');

    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

const generateCoverLetter = async (resumeText, jobDescription, userDetails) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const maxChars = 8000;
    const truncatedResume = resumeText.length > maxChars
      ? resumeText.substring(0, maxChars) + '...'
      : resumeText;
    const truncatedJob = jobDescription.length > maxChars
      ? jobDescription.substring(0, maxChars) + '...'
      : jobDescription;

    const prompt = `You are a professional cover letter writer. Create a compelling, personalized cover letter based on the following information.

CANDIDATE INFORMATION:
Name: ${userDetails.name || 'Candidate'}
Email: ${userDetails.email || ''}

JOB DESCRIPTION:
${truncatedJob}

RESUME/BACKGROUND:
${truncatedResume}

Write a professional cover letter that:
1. Addresses the specific job requirements
2. Highlights relevant experience from the resume
3. Shows enthusiasm for the role
4. Is professional yet personable
5. Is 3-4 paragraphs long

Return ONLY the cover letter text, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetter = response.text();

    if (!coverLetter || coverLetter.trim().length === 0) {
      throw new Error('Failed to generate cover letter');
    }

    return {
      success: true,
      coverLetter: coverLetter.trim()
    };
  } catch (error) {
    console.error('=== Gemini Cover Letter Error ===');
    console.error('Error Message:', error.message);
    console.error('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.error('================================');

    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

const generateQuestions = async (jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const maxChars = 8000;
    const truncatedJob = jobDescription.length > maxChars
      ? jobDescription.substring(0, maxChars) + '...'
      : jobDescription;

    const prompt = `You are an expert interviewer and hiring manager. Based on the following job description, generate exactly 5 interview questions that would help evaluate a candidate's fit for this role.

JOB DESCRIPTION:
${truncatedJob}

Generate a mix of technical, behavioral, and situational questions. Return ONLY valid JSON in this format (no other text):
{
  "questions": [
    { "id": 1, "question": "Your question here?", "type": "technical", "difficulty": "medium" },
    { "id": 2, "question": "Your question here?", "type": "behavioral", "difficulty": "easy" },
    { "id": 3, "question": "Your question here?", "type": "situational", "difficulty": "medium" },
    { "id": 4, "question": "Your question here?", "type": "technical", "difficulty": "hard" },
    { "id": 5, "question": "Your question here?", "type": "behavioral", "difficulty": "medium" }
  ]
}

Types must be one of: technical, behavioral, situational
Difficulty must be one of: easy, medium, hard
Make questions specific to the job description provided.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    return { success: true, questions: parsed.questions };
  } catch (error) {
    console.error('=== Gemini Questions Error ===');
    console.error('Error Message:', error.message);
    console.error('=============================');
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

const evaluateAnswers = async (jobDescription, questionsAndAnswers) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const maxChars = 6000;
    const truncatedJob = jobDescription.length > maxChars
      ? jobDescription.substring(0, maxChars) + '...'
      : jobDescription;

    const qaText = questionsAndAnswers.map((qa, i) =>
      `Question ${i + 1} (${qa.type}): ${qa.question}\nCandidate's Answer: ${qa.answer || '(No answer provided)'}`
    ).join('\n\n');

    const prompt = `You are an expert interviewer evaluating a candidate's interview responses for a job position.

JOB DESCRIPTION:
${truncatedJob}

INTERVIEW QUESTIONS AND ANSWERS:
${qaText}

Evaluate each answer and provide a detailed assessment. Return ONLY valid JSON in this format (no other text):
{
  "overallScore": <number 0-100>,
  "questions": [
    {
      "id": 1,
      "score": <number 0-100>,
      "feedback": "Specific feedback on this answer",
      "idealAnswer": "Brief ideal answer hint",
      "strengths": ["strength1"],
      "improvements": ["improvement1"]
    }
  ],
  "summary": "2-3 sentence overall assessment",
  "tips": ["tip1", "tip2", "tip3"]
}

Be constructive and specific. Score based on relevance, depth, clarity, and alignment with the job requirements.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response');

    const evaluation = JSON.parse(jsonMatch[0]);
    return { success: true, evaluation };
  } catch (error) {
    console.error('=== Gemini Evaluation Error ===');
    console.error('Error Message:', error.message);
    console.error('===============================');
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

module.exports = { analyzeResume, generateCoverLetter, generateQuestions, evaluateAnswers };
