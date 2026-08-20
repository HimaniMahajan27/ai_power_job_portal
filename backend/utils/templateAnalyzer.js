// Template-based analyzer as fallback when AI APIs fail
// This uses simple keyword matching and heuristics

const analyzeResume = (resumeText, jobDescription) => {
  try {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract common tech skills
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
      'typescript', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
      'git', 'agile', 'scrum', 'rest', 'api', 'html', 'css', 'c++',
      'php', 'ruby', 'golang', 'rust', 'swift', 'kotlin', 'flutter'
    ];

    const extractSkills = (text) => {
      return commonSkills.filter(skill => text.includes(skill));
    };

    const resumeSkills = extractSkills(resumeLower);
    const jobSkills = extractSkills(jobLower);

    const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
    const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));

    // Calculate match percentage
    const skillsMatchPercentage = jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 50;

    // Simple keyword matching for job description
    const jobKeywords = jobLower.match(/\b[a-z]{4,}\b/g) || [];
    const uniqueJobKeywords = [...new Set(jobKeywords)].slice(0, 20);

    const matchedKeywords = uniqueJobKeywords.filter(kw => resumeLower.includes(kw));
    const missingKeywords = uniqueJobKeywords.filter(kw => !resumeLower.includes(kw)).slice(0, 10);

    const keywordMatchPercentage = uniqueJobKeywords.length > 0
      ? Math.round((matchedKeywords.length / uniqueJobKeywords.length) * 100)
      : 50;

    // Experience detection (very basic)
    const experienceYears = resumeText.match(/(\d+)\s*\+?\s*years?/gi);
    const experienceScore = experienceYears ? 75 : 50;

    // Education detection
    const hasEducation = /bachelor|master|phd|degree|university|college/i.test(resumeText);
    const educationScore = hasEducation ? 80 : 40;

    // Calculate overall match
    const overallMatch = Math.round(
      (skillsMatchPercentage * 0.4) +
      (keywordMatchPercentage * 0.3) +
      (experienceScore * 0.2) +
      (educationScore * 0.1)
    );

    // Generate strengths and improvements
    const strengths = [];
    if (matchedSkills.length >= 3) {
      strengths.push(`Strong technical skills in ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    if (hasEducation) {
      strengths.push('Solid educational background');
    }
    if (experienceYears) {
      strengths.push('Relevant professional experience');
    }
    if (strengths.length === 0) {
      strengths.push('Demonstrates interest in the field', 'Shows potential for growth');
    }

    const improvements = [];
    if (missingSkills.length > 0) {
      improvements.push({
        area: 'Skills',
        suggestion: `Consider adding experience with: ${missingSkills.slice(0, 3).join(', ')}`,
        priority: 'high'
      });
    }
    if (!/quantif|metric|percent|increase|decrease|improve/i.test(resumeText)) {
      improvements.push({
        area: 'Experience',
        suggestion: 'Add quantifiable achievements and metrics to demonstrate impact',
        priority: 'high'
      });
    }
    if (!/project|developed|built|created|designed/i.test(resumeText)) {
      improvements.push({
        area: 'Projects',
        suggestion: 'Include specific projects that demonstrate your skills',
        priority: 'medium'
      });
    }

    const atsScore = Math.round(
      (skillsMatchPercentage * 0.5) +
      (keywordMatchPercentage * 0.5)
    );

    const summary = `Your resume shows a ${overallMatch}% match with this job. ${
      matchedSkills.length > 0
        ? `Strong alignment in ${matchedSkills.slice(0, 2).join(' and ')}.`
        : 'Focus on highlighting relevant skills.'
    } ${
      missingSkills.length > 0
        ? `Consider developing skills in ${missingSkills.slice(0, 2).join(' and ')}.`
        : ''
    }`;

    return {
      success: true,
      analysis: {
        overallMatch,
        skillsMatch: {
          matched: matchedSkills,
          missing: missingSkills,
          matchPercentage: skillsMatchPercentage
        },
        experienceMatch: {
          score: experienceScore,
          feedback: experienceYears
            ? 'Your experience aligns with the job requirements.'
            : 'Consider highlighting more specific work experience with dates and durations.'
        },
        keywordAnalysis: {
          matched: matchedKeywords.slice(0, 10),
          missing: missingKeywords,
          matchPercentage: keywordMatchPercentage
        },
        educationMatch: {
          score: educationScore,
          feedback: hasEducation
            ? 'Your educational background is well-documented.'
            : 'Consider adding your educational qualifications if applicable.'
        },
        strengths,
        improvements,
        atsScore,
        summary
      }
    };
  } catch (error) {
    console.error('Template Analyzer Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const generateCoverLetter = (resumeText, jobDescription, userDetails) => {
  try {
    const companyName = userDetails.name || 'Hiring Manager';
    const candidateName = userDetails.candidateName || userDetails.email?.split('@')[0] || 'Your Name';
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract specific skills from resume that match the job
    const skillCategories = {
      'web development': ['javascript', 'react', 'node', 'angular', 'vue', 'html', 'css', 'typescript', 'next.js', 'express'],
      'data analysis & science': ['python', 'data', 'analytics', 'pandas', 'numpy', 'machine learning', 'tensorflow', 'sql'],
      'cloud & DevOps': ['aws', 'cloud', 'devops', 'docker', 'kubernetes', 'azure', 'gcp', 'ci/cd'],
      'mobile development': ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios'],
      'backend development': ['java', 'spring', 'django', 'flask', 'golang', 'rust', 'c#', '.net', 'php', 'laravel'],
      'database management': ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase'],
      'project management': ['agile', 'scrum', 'jira', 'leadership', 'team lead', 'management']
    };

    const matchedCategories = [];
    const matchedSpecificSkills = [];
    for (const [category, keywords] of Object.entries(skillCategories)) {
      const found = keywords.filter(kw => resumeLower.includes(kw) && jobLower.includes(kw));
      if (found.length > 0) {
        matchedCategories.push(category);
        matchedSpecificSkills.push(...found);
      }
    }

    // Extract experience info
    const experienceMatch = resumeText.match(/(\d+)\s*\+?\s*years?/i);
    const experienceText = experienceMatch ? `${experienceMatch[1]}+ years of` : '';

    // Extract job title from job description
    const titlePatterns = [
      /(?:position|role|title|hiring|looking for)[:\s]+([^\n,.]+)/i,
      /^([^\n]{5,60})$/m
    ];
    let jobTitle = '';
    for (const pattern of titlePatterns) {
      const match = jobDescription.match(pattern);
      if (match) {
        jobTitle = match[1].trim();
        break;
      }
    }

    // Build skills text
    const skillsText = matchedSpecificSkills.length > 0
      ? matchedSpecificSkills.slice(0, 5).join(', ')
      : matchedCategories.length > 0
        ? matchedCategories.slice(0, 3).join(', ')
        : 'various technical domains';

    const categoryText = matchedCategories.length > 0
      ? matchedCategories.slice(0, 2).join(' and ')
      : 'software development';

    // Build opening paragraph
    const opening = jobTitle
      ? `I am writing to express my strong interest in the ${jobTitle} position. After carefully reviewing the job description, I am confident that my background and skills make me an excellent fit for this role.`
      : `I am writing to express my strong interest in this position. After carefully reviewing the job description, I am confident that my background and skills align well with your requirements.`;

    // Build experience paragraph
    const experienceParagraph = experienceText
      ? `With ${experienceText} professional experience in ${categoryText}, I have developed strong expertise in ${skillsText}. My hands-on experience has equipped me with the technical proficiency and problem-solving abilities needed to deliver impactful results and contribute meaningfully to your team.`
      : `Through my professional experience and projects in ${categoryText}, I have built a solid foundation in ${skillsText}. My background has equipped me with the technical expertise and problem-solving abilities needed to excel in this role and make meaningful contributions from day one.`;

    // Build value proposition paragraph
    const valueParagraphs = [];
    if (matchedSpecificSkills.length >= 3) {
      valueParagraphs.push(`My proficiency in ${matchedSpecificSkills.slice(0, 3).join(', ')} directly aligns with the technical requirements outlined in the job description.`);
    }
    if (/lead|manage|team|mentor/i.test(resumeText)) {
      valueParagraphs.push(`Beyond my technical abilities, I bring leadership experience and the ability to collaborate effectively within cross-functional teams.`);
    }
    if (/project|deliver|ship|deploy|launch/i.test(resumeText)) {
      valueParagraphs.push(`I have a proven track record of delivering projects from concept to completion, ensuring quality and meeting deadlines.`);
    }
    const valueText = valueParagraphs.length > 0
      ? valueParagraphs.join(' ')
      : `I am a dedicated professional who takes pride in writing clean, maintainable code and continuously learning new technologies to stay current in the ever-evolving tech landscape.`;

    const coverLetter = `Dear ${companyName},

${opening}

${experienceParagraph}

${valueText} I am particularly excited about this opportunity because it aligns with my career goals and would allow me to leverage my existing skills while continuing to grow professionally.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can contribute to your team's success.

Sincerely,
${candidateName}`;

    return {
      success: true,
      coverLetter
    };
  } catch (error) {
    console.error('Template Cover Letter Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const generateQuestions = (jobDescription) => {
  try {
    const jobLower = jobDescription.toLowerCase();

    // Question banks by category
    const technicalQuestions = {
      'web development': [
        'Explain the difference between client-side and server-side rendering. When would you choose one over the other?',
        'How do you handle state management in a large-scale web application?',
        'Describe your approach to optimizing web application performance.',
        'How would you implement authentication and authorization in a web application?',
        'Explain how you would design a RESTful API for a complex feature.'
      ],
      'data': [
        'How would you approach cleaning and preprocessing a large, messy dataset?',
        'Explain the difference between supervised and unsupervised learning with examples.',
        'How do you handle missing data in your analysis?',
        'Describe a time you used data to drive a business decision.',
        'How would you validate the accuracy of a predictive model?'
      ],
      'cloud': [
        'How would you design a highly available and scalable cloud architecture?',
        'Explain your experience with containerization and orchestration tools.',
        'How do you approach monitoring and logging in a cloud environment?',
        'Describe your strategy for managing infrastructure as code.',
        'How would you handle a security incident in a cloud environment?'
      ],
      'mobile': [
        'How do you handle offline functionality in mobile applications?',
        'Describe your approach to testing mobile applications across different devices.',
        'How do you optimize mobile app performance and battery usage?',
        'Explain how you handle push notifications in your mobile apps.',
        'How do you ensure a consistent user experience across iOS and Android?'
      ],
      'general': [
        'Describe a challenging technical problem you solved recently. What was your approach?',
        'How do you stay updated with the latest technologies and industry trends?',
        'Explain your approach to writing maintainable and scalable code.',
        'How do you handle technical debt in a project?',
        'Describe your experience working with version control and CI/CD pipelines.'
      ]
    };

    const behavioralQuestions = [
      'Tell me about a time you had to work under a tight deadline. How did you manage it?',
      'Describe a situation where you disagreed with a team member. How did you resolve it?',
      'Tell me about a project that failed. What did you learn from it?',
      'How do you prioritize tasks when you have multiple competing deadlines?',
      'Describe a time when you had to learn a new technology quickly for a project.'
    ];

    const situationalQuestions = [
      'If you were assigned a project with unclear requirements, how would you proceed?',
      'How would you handle a situation where a critical bug is found right before a release?',
      'If a stakeholder requested a feature that would compromise code quality, what would you do?',
      'How would you onboard a new team member to a complex codebase?',
      'If you noticed a colleague consistently missing deadlines, how would you address it?'
    ];

    // Determine the best technical category
    let techCategory = 'general';
    if (/react|angular|vue|frontend|front-end|html|css|javascript|web dev/i.test(jobLower)) {
      techCategory = 'web development';
    } else if (/data|analytics|machine learning|python|sql|database/i.test(jobLower)) {
      techCategory = 'data';
    } else if (/aws|cloud|devops|docker|kubernetes|azure/i.test(jobLower)) {
      techCategory = 'cloud';
    } else if (/mobile|android|ios|react native|flutter|swift/i.test(jobLower)) {
      techCategory = 'mobile';
    }

    const techPool = technicalQuestions[techCategory];

    // Pick 2 technical, 2 behavioral, 1 situational
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const selectedTech = shuffle(techPool).slice(0, 2);
    const selectedBehavioral = shuffle(behavioralQuestions).slice(0, 2);
    const selectedSituational = shuffle(situationalQuestions).slice(0, 1);

    const questions = [
      { id: 1, question: selectedTech[0], type: 'technical', difficulty: 'medium' },
      { id: 2, question: selectedBehavioral[0], type: 'behavioral', difficulty: 'easy' },
      { id: 3, question: selectedSituational[0], type: 'situational', difficulty: 'medium' },
      { id: 4, question: selectedTech[1], type: 'technical', difficulty: 'hard' },
      { id: 5, question: selectedBehavioral[1], type: 'behavioral', difficulty: 'medium' }
    ];

    return { success: true, questions };
  } catch (error) {
    console.error('Template Questions Error:', error);
    return { success: false, error: error.message };
  }
};

const evaluateAnswers = (jobDescription, questionsAndAnswers) => {
  try {
    const jobLower = jobDescription.toLowerCase();
    const jobKeywords = [...new Set((jobLower.match(/\b[a-z]{4,}\b/g) || []))].slice(0, 30);

    const questionResults = questionsAndAnswers.map((qa, index) => {
      const answer = (qa.answer || '').trim();
      const answerLower = answer.toLowerCase();
      const wordCount = answer.split(/\s+/).filter(w => w.length > 0).length;

      // Score based on multiple factors
      let score = 0;

      // Length score (0-30): Good answers are typically 50-200 words
      if (wordCount === 0) score += 0;
      else if (wordCount < 20) score += 10;
      else if (wordCount < 50) score += 20;
      else if (wordCount <= 200) score += 30;
      else score += 25;

      // Keyword relevance (0-30)
      const matchedKeywords = jobKeywords.filter(kw => answerLower.includes(kw));
      const keywordScore = Math.min(30, Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 60));
      score += keywordScore;

      // Structure & specificity (0-20)
      if (/example|for instance|specifically|in my experience/i.test(answer)) score += 10;
      if (/result|outcome|achieved|improved|increased|decreased|reduced/i.test(answer)) score += 10;

      // Completeness (0-20)
      if (wordCount >= 30) score += 10;
      if (/because|therefore|as a result|this led to/i.test(answer)) score += 10;

      score = Math.min(100, Math.max(0, score));

      // Generate feedback
      const strengths = [];
      const improvements = [];

      if (wordCount >= 50) strengths.push('Provided a detailed response');
      if (/example|for instance|specifically/i.test(answer)) strengths.push('Included specific examples');
      if (/result|outcome|achieved/i.test(answer)) strengths.push('Mentioned measurable outcomes');
      if (matchedKeywords.length >= 3) strengths.push('Used relevant terminology');

      if (wordCount < 30) improvements.push('Provide a more detailed response with specific examples');
      if (!/example|for instance|specifically/i.test(answer)) improvements.push('Include concrete examples from your experience');
      if (!/result|outcome|achieved|improved/i.test(answer)) improvements.push('Quantify your impact with measurable results');
      if (matchedKeywords.length < 2) improvements.push('Use more industry-relevant terminology');

      if (strengths.length === 0) strengths.push('Attempted to answer the question');
      if (improvements.length === 0) improvements.push('Continue practicing to build confidence');

      let feedback = '';
      if (score >= 80) feedback = 'Excellent response! Well-structured with relevant details.';
      else if (score >= 60) feedback = 'Good answer with room for improvement. Add more specifics.';
      else if (score >= 40) feedback = 'Adequate response. Consider adding examples and quantifiable results.';
      else if (wordCount === 0) feedback = 'No answer provided. Practice articulating your thoughts on this topic.';
      else feedback = 'Needs significant improvement. Focus on providing detailed, relevant examples.';

      return {
        id: index + 1,
        score,
        feedback,
        idealAnswer: 'Use the STAR method (Situation, Task, Action, Result) to structure your response with specific examples.',
        strengths,
        improvements
      };
    });

    const overallScore = Math.round(
      questionResults.reduce((sum, q) => sum + q.score, 0) / questionResults.length
    );

    let summary = '';
    if (overallScore >= 80) summary = 'Strong performance overall. You demonstrated good knowledge and communication skills. Focus on maintaining consistency across all answers.';
    else if (overallScore >= 60) summary = 'Decent performance with some strong answers. Work on providing more specific examples and quantifying your achievements to strengthen weaker areas.';
    else if (overallScore >= 40) summary = 'Average performance. Focus on preparing structured responses using the STAR method and practicing with common interview questions.';
    else summary = 'There is significant room for improvement. Practice answering interview questions aloud, prepare specific examples from your experience, and research the company and role thoroughly.';

    const tips = [
      'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
      'Research the company and role thoroughly before the interview',
      'Prepare 3-5 specific examples from your experience that showcase different skills',
      'Practice answering questions aloud to improve fluency and confidence',
      'Ask thoughtful questions about the role and team at the end of the interview'
    ];

    return {
      success: true,
      evaluation: { overallScore, questions: questionResults, summary, tips }
    };
  } catch (error) {
    console.error('Template Evaluation Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { analyzeResume, generateCoverLetter, generateQuestions, evaluateAnswers };
