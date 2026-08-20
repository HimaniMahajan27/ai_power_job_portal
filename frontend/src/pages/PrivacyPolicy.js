import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container" style={{ padding: '100px 24px 80px' }}>
      <h1 style={{ marginBottom: '16px' }}>Privacy Policy</h1>
      <p style={{ marginBottom: '24px', maxWidth: 800 }}>
        This Privacy Policy explains how JobPortal collects, uses, and protects your information
        when you use our platform as a job seeker or employer.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Information We Collect</h2>
      <p style={{ maxWidth: 800 }}>
        We collect information you provide directly to us, such as when you create an account,
        complete your profile, apply for jobs, or post job listings. This may include your name,
        contact details, resume/CV, work history, and any additional details you choose to share.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>How We Use Your Information</h2>
      <ul style={{ maxWidth: 800, paddingLeft: '20px' }}>
        <li>To create and manage your JobPortal account.</li>
        <li>To connect job seekers with employers and job opportunities.</li>
        <li>To improve and personalize your experience on the platform.</li>
        <li>To communicate with you about your account, jobs, and platform updates.</li>
      </ul>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Data Sharing</h2>
      <p style={{ maxWidth: 800 }}>
        We share your information with employers when you apply to their jobs, and with service
        providers that help us operate JobPortal (such as hosting and analytics). We do not sell
        your personal data.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Your Choices</h2>
      <p style={{ maxWidth: 800 }}>
        You can update or delete your profile information at any time from your account settings.
        If you wish to delete your account entirely, please contact support using the contact
        options provided in the app.
      </p>
    </div>
  );
};

export default PrivacyPolicy;

