import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="container" style={{ padding: '100px 24px 80px' }}>
      <h1 style={{ marginBottom: '16px' }}>Cookie Policy</h1>
      <p style={{ marginBottom: '24px', maxWidth: 800 }}>
        This Cookie Policy explains how JobPortal uses cookies and similar technologies to
        recognize you when you visit or use our platform.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>What Are Cookies?</h2>
      <p style={{ maxWidth: 800 }}>
        Cookies are small text files placed on your device that help us remember your preferences,
        keep you signed in, and understand how you use the platform.
      </p>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>How We Use Cookies</h2>
      <ul style={{ maxWidth: 800, paddingLeft: '20px' }}>
        <li>To keep you logged in and secure your session.</li>
        <li>To remember your preferences, such as theme and language.</li>
        <li>To analyze traffic and improve the performance of JobPortal.</li>
      </ul>

      <h2 style={{ marginTop: '32px', marginBottom: '12px' }}>Managing Cookies</h2>
      <p style={{ maxWidth: 800 }}>
        You can control or delete cookies through your browser settings. Please note that
        disabling certain cookies may impact your experience and some features may not work
        correctly.
      </p>
    </div>
  );
};

export default CookiePolicy;

