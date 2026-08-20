const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAiLimit, getAiUsage } = require('../middleware/aiLimiter');
const { generateQuestions, evaluateAnswers } = require('../utils/aiAnalyzer');

// @route   GET /api/practice-test/usage
// @desc    Get daily practice test usage count
// @access  Private
router.get('/usage', protect, getAiUsage('practiceTest'));

// @route   POST /api/practice-test/generate
// @desc    Generate interview questions from job description
// @access  Private
router.post('/generate', protect, checkAiLimit('practiceTest'), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    const trimmedJob = jobDescription.trim();
    if (trimmedJob.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a more detailed job description (minimum 50 characters)'
      });
    }

    const result = await generateQuestions(trimmedJob);

    if (!result.success) {
      const statusCode = result.error.includes('quota') || result.error.includes('rate limit')
        ? 429
        : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      questions: result.questions,
      provider: result.provider || 'AI'
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating questions. Please try again.'
    });
  }
});

// @route   POST /api/practice-test/evaluate
// @desc    Evaluate candidate answers
// @access  Private
router.post('/evaluate', protect, async (req, res) => {
  try {
    const { jobDescription, questionsAndAnswers } = req.body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers) || questionsAndAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions and answers are required'
      });
    }

    const result = await evaluateAnswers(jobDescription.trim(), questionsAndAnswers);

    if (!result.success) {
      const statusCode = result.error.includes('quota') || result.error.includes('rate limit')
        ? 429
        : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error
      });
    }

    res.status(200).json({
      success: true,
      evaluation: result.evaluation,
      provider: result.provider || 'AI'
    });
  } catch (error) {
    console.error('Answer evaluation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while evaluating answers. Please try again.'
    });
  }
});

module.exports = router;
