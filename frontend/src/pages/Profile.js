import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiPhoneCall,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiX,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiFileText,
  FiAward,
  FiBook
} from 'react-icons/fi';
import DefaultAvatar from '../components/DefaultAvatar';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || '',
    professionalSummary: user?.professionalSummary || '',
    skills: user?.skills || [],
    education: user?.education || [],
    experience: user?.experience || [],
    certifications: user?.certifications || []
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [resumePreview, setResumePreview] = useState(user?.resumeFile || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
          setAvatarFile(file); // Store the actual file
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setResumeFile(file); // Store the actual file
        setResumePreview('resume.pdf');
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const deleteAvatar = () => {
    setAvatarPreview('');
    setAvatarFile(null);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', graduationYear: '', grade: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }]
    }));
  };

  const updateExperience = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialUrl: '' }]
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all text fields
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('city', formData.city);
      submitData.append('state', formData.state);
      submitData.append('country', formData.country);
      submitData.append('professionalSummary', formData.professionalSummary);
      submitData.append('skills', JSON.stringify(formData.skills));
      submitData.append('education', JSON.stringify(formData.education));
      submitData.append('experience', JSON.stringify(formData.experience));
      submitData.append('certifications', JSON.stringify(formData.certifications));

      // Add avatar file if selected
      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      // Add resume file if selected
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      const { data } = await axios.put('auth/profile', submitData);

      // Update form data with response
      if (data.user) {
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          city: data.user.location?.city || '',
          state: data.user.location?.state || '',
          country: data.user.location?.country || '',
          professionalSummary: data.user.professionalSummary || '',
          skills: data.user.skills || [],
          education: data.user.education || [],
          experience: data.user.experience || [],
          certifications: data.user.certifications || []
        });
        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar);
        }
        if (data.user.resumeFile) {
          setResumePreview('resume.pdf');
        }
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Clear file states after upload
      setAvatarFile(null);
      setResumeFile(null);
    } catch (error) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.message || error.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const ViewMode = () => (
    <div className="profile-container">
      <div className="profile-header card">
        <div className="profile-avatar-section">
          <DefaultAvatar
            src={avatarPreview || user?.avatar}
            alt={user?.name}
            size={120}
            className="profile-avatar"
          />
          <h1 className="profile-name">{user?.name}</h1>
          <p className="profile-role">{user?.role}</p>
        </div>
      </div>

      <div className="profile-grid">
        <motion.div className="card info-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="info-item">
            <FiMail className="info-icon" />
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="card info-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="info-item">
            <FiBriefcase className="info-icon" />
            <div>
              <p className="info-label">Role</p>
              <p className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
        </motion.div>

        {user?.phone && (
          <motion.div className="card info-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="info-item">
              <FiPhoneCall className="info-icon" />
              <div>
                <p className="info-label">Phone</p>
                <p className="info-value">{user?.phone}</p>
              </div>
            </div>
          </motion.div>
        )}

        {(user?.location?.city || user?.location?.state) && (
          <motion.div className="card info-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="info-item">
              <FiMapPin className="info-icon" />
              <div>
                <p className="info-label">Location</p>
                <p className="info-value">{[user?.location?.city, user?.location?.state, user?.location?.country].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {user?.professionalSummary && (
        <motion.div className="card summary-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title"><FiFileText /> Professional Summary</h2>
          <p className="summary-text">{user?.professionalSummary}</p>
        </motion.div>
      )}

      {user?.skills && user.skills.length > 0 && (
        <motion.div className="card skills-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title">Skills</h2>
          <div className="skills-list">
            {user.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </motion.div>
      )}

      {user?.education && user.education.length > 0 && (
        <motion.div className="card education-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title"><FiBook /> Education</h2>
          {user.education.map((edu, idx) => (
            <div key={idx} className="timeline-item">
              <p className="timeline-title">{edu.degree} in {edu.field}</p>
              <p className="timeline-subtitle">{edu.institution}</p>
              <p className="timeline-date">Graduated: {edu.graduationYear}</p>
            </div>
          ))}
        </motion.div>
      )}

      {user?.experience && user.experience.length > 0 && (
        <motion.div className="card experience-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title"><FiBriefcase /> Experience</h2>
          {user.experience.map((exp, idx) => (
            <div key={idx} className="timeline-item">
              <p className="timeline-title">{exp.position}</p>
              <p className="timeline-subtitle">{exp.company}</p>
              <p className="timeline-date">{new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}</p>
              {exp.description && <p className="timeline-description">{exp.description}</p>}
            </div>
          ))}
        </motion.div>
      )}

      {user?.certifications && user.certifications.length > 0 && (
        <motion.div className="card certifications-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="section-title"><FiAward /> Certifications</h2>
          {user.certifications.map((cert, idx) => (
            <div key={idx} className="timeline-item">
              <p className="timeline-title">{cert.name}</p>
              <p className="timeline-subtitle">{cert.issuingOrganization}</p>
              <p className="timeline-date">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
            </div>
          ))}
        </motion.div>
      )}

      <button className="btn btn-primary btn-lg edit-button" onClick={() => setIsEditing(true)}>
        <FiEdit2 /> Edit Profile
      </button>
    </div>
  );

  const EditMode = () => (
    <motion.form onSubmit={handleSubmit} className="edit-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Profile Picture Section */}
      <div className="card form-section">
        <h2 className="section-title"><FiUser /> Profile Picture</h2>
        <div className="avatar-upload-area">
          <DefaultAvatar
            src={avatarPreview}
            alt={user?.name}
            size={100}
            className="avatar-preview"
          />
          <div className="avatar-actions">
            <label className="btn btn-secondary">
              <FiUpload /> {avatarPreview ? 'Change' : 'Upload'} Picture
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
            {avatarPreview && (
              <button type="button" className="btn btn-danger" onClick={deleteAvatar}>
                <FiTrash2 /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="card form-section">
        <h2 className="section-title">Basic Information</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="card form-section">
        <h2 className="section-title"><FiFileText /> Professional Summary</h2>
        <div className="form-group">
          <textarea
            name="professionalSummary"
            value={formData.professionalSummary}
            onChange={handleInputChange}
            placeholder="Write a brief professional summary about yourself..."
            rows="4"
            className="form-textarea"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="card form-section">
        <h2 className="section-title">Skills</h2>
        <div className="skill-input-group">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g., React, JavaScript)"
            className="form-input"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button type="button" className="btn btn-secondary" onClick={addSkill}>
            <FiPlus /> Add
          </button>
        </div>
        <div className="skills-list">
          {formData.skills.map((skill, idx) => (
            <div key={idx} className="skill-item">
              <span>{skill}</span>
              <button type="button" onClick={() => removeSkill(idx)} className="skill-remove">
                <FiX />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="card form-section">
        <h2 className="section-title"><FiBook /> Education</h2>
        {formData.education.map((edu, idx) => (
          <div key={idx} className="form-subsection">
            <div className="subsection-header">
              <h4>Education #{idx + 1}</h4>
              <button type="button" className="btn-remove" onClick={() => removeEducation(idx)}>
                <FiTrash2 />
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                  className="form-input"
                  placeholder="University/College name"
                />
              </div>
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(idx, 'field', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  value={edu.graduationYear}
                  onChange={(e) => updateEducation(idx, 'graduationYear', e.target.value)}
                  className="form-input"
                  placeholder="2023"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Grade/GPA</label>
              <input
                type="text"
                value={edu.grade}
                onChange={(e) => updateEducation(idx, 'grade', e.target.value)}
                className="form-input"
                placeholder="e.g., 3.8/4.0"
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addEducation}>
          <FiPlus /> Add Education
        </button>
      </div>

      {/* Experience */}
      <div className="card form-section">
        <h2 className="section-title"><FiBriefcase /> Work Experience</h2>
        {formData.experience.map((exp, idx) => (
          <div key={idx} className="form-subsection">
            <div className="subsection-header">
              <h4>Experience #{idx + 1}</h4>
              <button type="button" className="btn-remove" onClick={() => removeExperience(idx)}>
                <FiTrash2 />
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  className="form-input"
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                  className="form-input"
                  placeholder="Job title"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={exp.startDate?.split('T')[0] || ''}
                  onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={exp.endDate?.split('T')[0] || ''}
                  onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                  className="form-input"
                  disabled={exp.current}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(idx, 'current', e.target.checked)}
                />
                I currently work here
              </label>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                className="form-textarea"
                placeholder="Describe your responsibilities and achievements"
                rows="3"
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addExperience}>
          <FiPlus /> Add Experience
        </button>
      </div>

      {/* Certifications */}
      <div className="card form-section">
        <h2 className="section-title"><FiAward /> Certifications</h2>
        {formData.certifications.map((cert, idx) => (
          <div key={idx} className="form-subsection">
            <div className="subsection-header">
              <h4>Certification #{idx + 1}</h4>
              <button type="button" className="btn-remove" onClick={() => removeCertification(idx)}>
                <FiTrash2 />
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Certification Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                  className="form-input"
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div className="form-group">
                <label>Issuing Organization</label>
                <input
                  type="text"
                  value={cert.issuingOrganization}
                  onChange={(e) => updateCertification(idx, 'issuingOrganization', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Issue Date</label>
                <input
                  type="date"
                  value={cert.issueDate?.split('T')[0] || ''}
                  onChange={(e) => updateCertification(idx, 'issueDate', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={cert.expiryDate?.split('T')[0] || ''}
                  onChange={(e) => updateCertification(idx, 'expiryDate', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Credential URL</label>
              <input
                type="url"
                value={cert.credentialUrl}
                onChange={(e) => updateCertification(idx, 'credentialUrl', e.target.value)}
                className="form-input"
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addCertification}>
          <FiPlus /> Add Certification
        </button>
      </div>

      {/* Resume Upload */}
      <div className="card form-section">
        <h2 className="section-title"><FiFileText /> Resume</h2>
        <label className="file-upload-label">
          <FiUpload /> {resumePreview ? 'Change Resume' : 'Upload Resume (PDF)'}
          <input type="file" accept=".pdf" onChange={handleResumeUpload} hidden />
        </label>
        {resumePreview && <p className="file-uploaded">✓ Resume uploaded</p>}
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setIsEditing(false);
            setFormData({
              name: user?.name || '',
              phone: user?.phone || '',
              city: user?.location?.city || '',
              state: user?.location?.state || '',
              country: user?.location?.country || '',
              professionalSummary: user?.professionalSummary || '',
              skills: user?.skills || [],
              education: user?.education || [],
              experience: user?.experience || [],
              certifications: user?.certifications || []
            });
            setAvatarPreview(user?.avatar || '');
            setResumePreview(user?.resumeFile || '');
            setAvatarFile(null);
            setResumeFile(null);
          }}
        >
          <FiX /> Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
        </button>
      </div>
    </motion.form>
  );

  return (
    <div className="profile-page">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information and professional details</p>
        </motion.div>

        {isEditing ? <EditMode /> : <ViewMode />}
      </div>
    </div>
  );
};

export default Profile;
