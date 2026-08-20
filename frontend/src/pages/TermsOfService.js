import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container" style={{ padding: '100px 24px 80px' }}>
      <h1 style={{ marginBottom: '16px' }}>Terms of Service</h1>
      <p style={{ marginBottom: '24px', maxWidth: 800 }}>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of JobPortal,
        including any content, functionality, and services offered on or through the platform.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Using JobPortal</h2>
      <p style={{ maxWidth: 800 }}>
        You agree to use JobPortal only for lawful purposes and in accordance with these Terms.
        You are responsible for maintaining the confidentiality of your account credentials and
        for all activities that occur under your account.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>User Content</h2>
      <p style={{ maxWidth: 800 }}>
        You retain ownership of the content you submit, such as profiles, resumes, and job
        postings. By submitting content, you grant JobPortal a non-exclusive license to host,
        display, and share that content as needed to provide the service.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Prohibited Activities</h2>
      <ul style={{ maxWidth: 800, paddingLeft: '20px' }}>
        <li>Posting misleading, fraudulent, or illegal job listings or profiles.</li>
        <li>Attempting to access another user&apos;s account without permission.</li>
        <li>Interfering with the security or operation of the platform.</li>
      </ul>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Disclaimer &amp; Liability</h2>
      <p style={{ maxWidth: 800 }}>
        JobPortal is provided &quot;as is&quot; without warranties of any kind. We do not
        guarantee specific job outcomes, and we are not responsible for the actions of employers
        or job seekers using the platform.
      </p>
    </div>
  );
};

export default TermsOfService;

