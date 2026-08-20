const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateCoverLetter = async (resumeText, companyName, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Truncate very long texts to avoid API limits (same as geminiAnalyzer.js)
    const maxChars = 8000;
    const truncatedResume = resumeText.length > maxChars
      ? resumeText.substring(0, maxChars) + '...'
      : resumeText;
    const truncatedJob = jobDescription.length > maxChars
      ? jobDescription.substring(0, maxChars) + '...'
      : jobDescription;

    const prompt = `You are a professional career coach and expert cover letter writer. Generate a compelling, professional cover letter based on the following information.

COMPANY NAME: ${companyName}

JOB DESCRIPTION:
${truncatedJob}

CANDIDATE'S RESUME:
${truncatedResume}

INSTRUCTIONS:
1. Write a professional cover letter (300-400 words MAXIMUM - CRITICAL for API limits)
2. Address it to "Hiring Manager" at ${companyName}
3. Highlight 3-4 most relevant qualifications from the resume that match the job requirements
4. Extract the job title from the description and reference it specifically in the opening paragraph
5. Show genuine enthusiasm for the role and company
6. Use confident, professional tone (not overly casual or generic)
7. Include specific examples from the resume that align with the job requirements
8. End with a clear call to action
9. DO NOT exceed 400 words (critical for token conservation)
10. Format with clear paragraph breaks using double newlines
11. Do NOT include placeholder text like [Your Name], [Date], or address fields

Return ONLY the cover letter body text, no additional commentary, explanations, or metadata.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const coverLetterText = response.text();

    // Validate output exists
    if (!coverLetterText || coverLetterText.trim().length === 0) {
      throw new Error('AI generated no response. Please try with different content.');
    }

    // Calculate word count
    const wordCount = coverLetterText.trim().split(/\s+/).length;
    const charCount = coverLetterText.trim().length;

    // If somehow exceeds 500 words, truncate (safety measure)
    if (wordCount > 500) {
      const words = coverLetterText.trim().split(/\s+/);
      const truncated = words.slice(0, 400).join(' ') + '...';
      return {
        success: true,
        coverLetter: truncated,
        wordCount: 400,
        charCount: truncated.length,
        truncated: true
      };
    }

    return {
      success: true,
      coverLetter: coverLetterText.trim(),
      wordCount: wordCount,
      charCount: charCount,
      truncated: false
    };
  } catch (error) {
    console.error('Gemini Cover Letter Error:', error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes('quota')) {
      return {
        success: false,
        error: 'API quota exceeded. Please try again later.'
      };
    }
    if (error.message && error.message.includes('rate limit')) {
      return {
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to generate cover letter. Please try again.'
    };
  }
};

module.exports = { generateCoverLetter };
