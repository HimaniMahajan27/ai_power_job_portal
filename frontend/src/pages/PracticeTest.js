import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiFileText,
  FiMic,
  FiMicOff,
  FiSend,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiAward,
  FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './PracticeTest.css';

const PracticeTest = () => {
  useAuth();

  // Stage: 'input' | 'questions' | 'report'
  const [stage, setStage] = useState('input');
  const [jobDescription, setJobDescription] = useState('');
  const [jobError, setJobError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Questions stage
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeRecording, setActiveRecording] = useState(null);
  const recognitionRef = useRef(null);

  // Report stage
  const [report, setReport] = useState(null);

  // Usage tracking
  const [usage, setUsage] = useState(null);

  const fetchUsage = async () => {
    try {
      const { data } = await axios.get('practice-test/usage');
      if (data.success) setUsage(data);
    } catch {}
  };

  useEffect(() => { fetchUsage(); }, []);

  // Check browser speech support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  const handleGenerateQuestions = async () => {
    if (!jobDescription.trim()) {
      setJobError('Job description is required');
      return;
    }
    if (jobDescription.trim().length < 50) {
      setJobError('Please provide a more detailed job description (minimum 50 characters)');
      return;
    }

    setLoading(true);
    setLoadingMessage('Generating interview questions...');
    setJobError('');

    try {
      const { data } = await axios.post('practice-test/generate', {
        jobDescription: jobDescription.trim()
      });

      if (data.success) {
        setQuestions(data.questions);
        setAnswers({});
        setStage('questions');
        fetchUsage();
        toast.success('Questions generated successfully!');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to generate questions';
      setJobError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const startRecording = useCallback((questionId) => {
    if (!speechSupported) {
      toast.error('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    // Stop any existing recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = answers[questionId] || '';
    // Add a space separator if there's existing text
    if (finalTranscript && !finalTranscript.endsWith(' ')) {
      finalTranscript += ' ';
    }

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript = transcript;
        }
      }
      setAnswers(prev => ({
        ...prev,
        [questionId]: finalTranscript + interimTranscript
      }));
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'aborted') {
        toast.error('Voice input error. Please try again.');
      }
      setActiveRecording(null);
    };

    recognition.onend = () => {
      setActiveRecording(null);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setActiveRecording(questionId);
    toast.success('Listening... Speak your answer');
  }, [SpeechRecognition, speechSupported, answers]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setActiveRecording(null);
  }, []);

  const handleSubmitAnswers = async () => {
    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim().length === 0);
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    // Stop any recording
    stopRecording();

    setLoading(true);
    setLoadingMessage('Evaluating your answers...');

    try {
      const questionsAndAnswers = questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        answer: answers[q.id] || ''
      }));

      const { data } = await axios.post('practice-test/evaluate', {
        jobDescription: jobDescription.trim(),
        questionsAndAnswers
      });

      if (data.success) {
        setReport(data.evaluation);
        setStage('report');
        toast.success('Evaluation complete!');
        setTimeout(() => {
          document.querySelector('.practice-test-report')?.scrollIntoView({
            behavior: 'smooth'
          });
        }, 100);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to evaluate answers';
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleStartOver = () => {
    stopRecording();
    setStage('input');
    setJobDescription('');
    setQuestions([]);
    setAnswers({});
    setReport(null);
    setJobError('');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return '#10B981';
    if (difficulty === 'medium') return '#F59E0B';
    return '#EF4444';
  };

  const getTypeIcon = (type) => {
    if (type === 'technical') return '💻';
    if (type === 'behavioral') return '🤝';
    return '🎯';
  };

  return (
    <div className="practice-test">
      <div className="pt-container">
        {/* Header */}
        <motion.div
          className="pt-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-icon">
            <FiAward />
          </div>
          <h1>AI Practice Test</h1>
          <p className="header-subtitle">
            Practice interview questions tailored to your target job and get AI-powered feedback
          </p>
          {usage && (
            <div className="usage-counter" style={{
              marginTop: '12px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: usage.remaining === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              color: usage.remaining === 0 ? '#EF4444' : '#10B981',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block'
            }}>
              {usage.remaining} / {usage.limit} tests remaining today
            </div>
          )}

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${stage === 'input' ? 'active' : stage !== 'input' ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <span>Job Description</span>
            </div>
            <FiChevronRight className="step-arrow" />
            <div className={`step ${stage === 'questions' ? 'active' : stage === 'report' ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <span>Answer Questions</span>
            </div>
            <FiChevronRight className="step-arrow" />
            <div className={`step ${stage === 'report' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>View Report</span>
            </div>
          </div>
        </motion.div>

        {/* Stage 1: Job Description Input */}
        {stage === 'input' && (
          <motion.div
            className="pt-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="form-section">
              <h2>Enter Job Description</h2>
              <p className="form-hint">
                Paste the job description for the role you want to practice for. The AI will generate relevant interview questions.
              </p>
              <textarea
                className="textarea-field"
                placeholder="Paste the full job description here. Include responsibilities, requirements, and qualifications for the best results..."
                value={jobDescription}
                onChange={(e) => { setJobDescription(e.target.value); setJobError(''); }}
                rows={12}
                maxLength={10000}
              />
              <div className="character-count">
                {jobDescription.length} / 10,000 characters
              </div>
              {jobError && <p className="error-message">{jobError}</p>}
            </div>

            <motion.button
              className="generate-button"
              onClick={handleGenerateQuestions}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Generating Questions...
                </>
              ) : (
                <>
                  <FiFileText />
                  Generate Interview Questions
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Stage 2: Answer Questions */}
        {stage === 'questions' && (
          <motion.div
            className="pt-questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="questions-header">
              <h2>Answer the Interview Questions</h2>
              <p className="form-hint">
                Type your answers or use the microphone button for voice input. Answer all 5 questions, then submit for evaluation.
              </p>
              {!speechSupported && (
                <div className="speech-warning">
                  <FiAlertCircle />
                  <span>Voice input is not supported in your browser. Use Chrome or Edge for voice input.</span>
                </div>
              )}
            </div>

            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                className="question-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="question-header">
                  <div className="question-number">
                    <span>{getTypeIcon(q.type)}</span>
                    <span>Question {q.id}</span>
                  </div>
                  <div className="question-badges">
                    <span className="badge badge-type">{q.type}</span>
                    <span
                      className="badge badge-difficulty"
                      style={{ color: getDifficultyColor(q.difficulty) }}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                <p className="question-text">{q.question}</p>

                <div className="answer-section">
                  <textarea
                    className="answer-field"
                    placeholder="Type your answer here or use the mic button..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    rows={4}
                  />
                  <div className="answer-actions">
                    {speechSupported && (
                      <button
                        className={`mic-button ${activeRecording === q.id ? 'recording' : ''}`}
                        onClick={() => activeRecording === q.id ? stopRecording() : startRecording(q.id)}
                        title={activeRecording === q.id ? 'Stop recording' : 'Start voice input'}
                      >
                        {activeRecording === q.id ? (
                          <>
                            <FiMicOff />
                            <span className="recording-indicator"></span>
                          </>
                        ) : (
                          <FiMic />
                        )}
                      </button>
                    )}
                    <span className="word-count">
                      {(answers[q.id] || '').split(/\s+/).filter(w => w.length > 0).length} words
                    </span>
                  </div>
                </div>

                {answers[q.id] && answers[q.id].trim().length > 0 && (
                  <div className="answer-status">
                    <FiCheckCircle color="#10B981" />
                    <span>Answered</span>
                  </div>
                )}
              </motion.div>
            ))}

            <div className="questions-footer">
              <span className="answered-count">
                {questions.filter(q => answers[q.id] && answers[q.id].trim().length > 0).length} / {questions.length} answered
              </span>
              <div className="footer-buttons">
                <motion.button
                  className="secondary-button"
                  onClick={handleStartOver}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiRefreshCw />
                  Start Over
                </motion.button>
                <motion.button
                  className="submit-button"
                  onClick={handleSubmitAnswers}
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Submit for Evaluation
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Evaluation Report */}
        {stage === 'report' && report && (
          <motion.div
            className="practice-test-report"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overall Score */}
            <div className="report-overall">
              <h2>Your Interview Performance</h2>
              <div className="overall-score-container">
                <div className="score-circle" style={{ '--score-color': getScoreColor(report.overallScore) }}>
                  <svg viewBox="0 0 120 120" className="score-svg">
                    <circle cx="60" cy="60" r="54" className="score-bg" />
                    <circle
                      cx="60" cy="60" r="54"
                      className="score-fill"
                      style={{
                        strokeDasharray: `${(report.overallScore / 100) * 339.292} 339.292`,
                        stroke: getScoreColor(report.overallScore)
                      }}
                    />
                  </svg>
                  <div className="score-text">
                    <span className="score-number">{report.overallScore}</span>
                    <span className="score-label">{getScoreLabel(report.overallScore)}</span>
                  </div>
                </div>
                <p className="overall-summary">{report.summary}</p>
              </div>
            </div>

            {/* Per-Question Breakdown */}
            <div className="report-questions">
              <h3><FiTrendingUp /> Question-by-Question Breakdown</h3>
              {report.questions && report.questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  className="report-question-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="rq-header">
                    <div className="rq-title">
                      <span>{getTypeIcon(questions[index]?.type)}</span>
                      <span>Question {q.id}</span>
                    </div>
                    <div className="rq-score" style={{ color: getScoreColor(q.score) }}>
                      {q.score}/100
                    </div>
                  </div>

                  <p className="rq-question">{questions[index]?.question}</p>

                  <div className="rq-your-answer">
                    <strong>Your Answer:</strong>
                    <p>{answers[questions[index]?.id] || '(No answer)'}</p>
                  </div>

                  <div className="rq-feedback">
                    <strong>Feedback:</strong>
                    <p>{q.feedback}</p>
                  </div>

                  {q.idealAnswer && (
                    <div className="rq-ideal">
                      <strong>Ideal Answer Hint:</strong>
                      <p>{q.idealAnswer}</p>
                    </div>
                  )}

                  <div className="rq-details">
                    {q.strengths && q.strengths.length > 0 && (
                      <div className="rq-strengths">
                        <strong>Strengths:</strong>
                        <ul>
                          {q.strengths.map((s, i) => <li key={i}><FiCheckCircle color="#10B981" /> {s}</li>)}
                        </ul>
                      </div>
                    )}
                    {q.improvements && q.improvements.length > 0 && (
                      <div className="rq-improvements">
                        <strong>Areas to Improve:</strong>
                        <ul>
                          {q.improvements.map((imp, i) => <li key={i}><FiAlertCircle color="#F59E0B" /> {imp}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Score bar */}
                  <div className="rq-score-bar">
                    <div
                      className="rq-score-fill"
                      style={{
                        width: `${q.score}%`,
                        backgroundColor: getScoreColor(q.score)
                      }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tips Section */}
            {report.tips && report.tips.length > 0 && (
              <div className="report-tips">
                <h3><FiAward /> Tips for Improvement</h3>
                <ul>
                  {report.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="report-actions">
              <motion.button
                className="generate-button"
                onClick={handleStartOver}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiRefreshCw />
                Practice Again
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            className="generating-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="generating-content">
              <div className="spinner-lg"></div>
              <h3>{loadingMessage || 'Processing...'}</h3>
              <p>This usually takes 5-15 seconds</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PracticeTest;
