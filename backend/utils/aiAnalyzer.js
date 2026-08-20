// Unified AI Analyzer with fallback chain: Gemini → Groq → Template

const geminiAnalyzer = require('./geminiAnalyzer');
const groqAnalyzer = require('./groqAnalyzer');
const templateAnalyzer = require('./templateAnalyzer');

const analyzeResume = async (resumeText, jobDescription) => {
  console.log('🤖 Starting AI Resume Analysis with fallback chain...');

  // Try Gemini first
  console.log('📊 Trying Gemini API...');
  const geminiResult = await geminiAnalyzer.analyzeResume(resumeText, jobDescription);
  if (geminiResult.success) {
    console.log('✅ Gemini API succeeded!');
    return { ...geminiResult, provider: 'Gemini AI' };
  }
  console.log('❌ Gemini API failed:', geminiResult.error);

  // Try Groq as fallback
  console.log('📊 Trying Groq API...');
  const groqResult = await groqAnalyzer.analyzeResume(resumeText, jobDescription);
  if (groqResult.success) {
    console.log('✅ Groq API succeeded!');
    return { ...groqResult, provider: 'Groq AI (Llama 3.3)' };
  }
  console.log('❌ Groq API failed:', groqResult.error);

  // Use template as final fallback
  console.log('📊 Using Template-based analysis...');
  const templateResult = templateAnalyzer.analyzeResume(resumeText, jobDescription);
  if (templateResult.success) {
    console.log('✅ Template analysis succeeded!');
    return { ...templateResult, provider: 'Rule-based Analysis' };
  }

  // All methods failed
  console.error('❌ All analysis methods failed!');
  return {
    success: false,
    error: 'All AI services are currently unavailable. Please try again later.'
  };
};

const generateCoverLetter = async (resumeText, jobDescription, userDetails) => {
  console.log('✉️ Starting AI Cover Letter Generation with fallback chain...');

  // Try Groq first (it's faster and better for generation)
  console.log('📝 Trying Groq API...');
  const groqResult = await groqAnalyzer.generateCoverLetter(resumeText, jobDescription, userDetails);
  if (groqResult.success) {
    console.log('✅ Groq API succeeded!');
    return { ...groqResult, provider: 'Groq AI (Llama 3.3)' };
  }
  console.log('❌ Groq API failed:', groqResult.error);

  // Try Gemini as fallback
  console.log('📝 Trying Gemini API...');
  const geminiResult = await geminiAnalyzer.generateCoverLetter(resumeText, jobDescription, userDetails);
  if (geminiResult.success) {
    console.log('✅ Gemini API succeeded!');
    return { ...geminiResult, provider: 'Gemini AI' };
  }
  console.log('❌ Gemini API failed:', geminiResult.error);

  // Use template as final fallback
  console.log('📝 Using Template-based generation...');
  const templateResult = templateAnalyzer.generateCoverLetter(resumeText, jobDescription, userDetails);
  if (templateResult.success) {
    console.log('✅ Template generation succeeded!');
    return { ...templateResult, provider: 'Template-based' };
  }

  // All methods failed
  console.error('❌ All generation methods failed!');
  return {
    success: false,
    error: 'All AI services are currently unavailable. Please try again later.'
  };
};

const generateQuestions = async (jobDescription) => {
  console.log('❓ Starting AI Question Generation with fallback chain...');

  // Try Groq first
  console.log('📝 Trying Groq API...');
  const groqResult = await groqAnalyzer.generateQuestions(jobDescription);
  if (groqResult.success) {
    console.log('✅ Groq API succeeded!');
    return { ...groqResult, provider: 'Groq AI (Llama 3.3)' };
  }
  console.log('❌ Groq API failed:', groqResult.error);

  // Try Gemini as fallback
  console.log('📝 Trying Gemini API...');
  const geminiResult = await geminiAnalyzer.generateQuestions(jobDescription);
  if (geminiResult.success) {
    console.log('✅ Gemini API succeeded!');
    return { ...geminiResult, provider: 'Gemini AI' };
  }
  console.log('❌ Gemini API failed:', geminiResult.error);

  // Use template as final fallback
  console.log('📝 Using Template-based generation...');
  const templateResult = templateAnalyzer.generateQuestions(jobDescription);
  if (templateResult.success) {
    console.log('✅ Template generation succeeded!');
    return { ...templateResult, provider: 'Template-based' };
  }

  console.error('❌ All question generation methods failed!');
  return {
    success: false,
    error: 'All AI services are currently unavailable. Please try again later.'
  };
};

const evaluateAnswers = async (jobDescription, questionsAndAnswers) => {
  console.log('📊 Starting AI Answer Evaluation with fallback chain...');

  // Try Groq first
  console.log('📝 Trying Groq API...');
  const groqResult = await groqAnalyzer.evaluateAnswers(jobDescription, questionsAndAnswers);
  if (groqResult.success) {
    console.log('✅ Groq API succeeded!');
    return { ...groqResult, provider: 'Groq AI (Llama 3.3)' };
  }
  console.log('❌ Groq API failed:', groqResult.error);

  // Try Gemini as fallback
  console.log('📝 Trying Gemini API...');
  const geminiResult = await geminiAnalyzer.evaluateAnswers(jobDescription, questionsAndAnswers);
  if (geminiResult.success) {
    console.log('✅ Gemini API succeeded!');
    return { ...geminiResult, provider: 'Gemini AI' };
  }
  console.log('❌ Gemini API failed:', geminiResult.error);

  // Use template as final fallback
  console.log('📝 Using Template-based evaluation...');
  const templateResult = templateAnalyzer.evaluateAnswers(jobDescription, questionsAndAnswers);
  if (templateResult.success) {
    console.log('✅ Template evaluation succeeded!');
    return { ...templateResult, provider: 'Template-based' };
  }

  console.error('❌ All evaluation methods failed!');
  return {
    success: false,
    error: 'All AI services are currently unavailable. Please try again later.'
  };
};

module.exports = { analyzeResume, generateCoverLetter, generateQuestions, evaluateAnswers };
