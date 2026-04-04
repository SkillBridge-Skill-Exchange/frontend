import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import SkillCard from '../components/SkillCard';
import { 
  ExternalLink, Github, Trash2, Plus, Star, Award, Mail, MapPin, 
  Linkedin, Globe, Edit3, X, Check, Zap, BookOpen, Pencil, Building, GraduationCap, Handshake, Search, Brain, Clock
} from 'lucide-react';
import '../profile.css';

// Mock path for project thumbnails
const MOCK_PROJECT_THUMB = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";

function Profile() {
  const { id } = useParams();
  const { user: currentUser, login } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [isVisitor, setIsVisitor] = useState(false);
  
  const [portfolio, setPortfolio] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({ skill_name: '', category: '', proficiency_level: 'beginner', description: '', type: 'offer' });

  const [editUser, setEditUser] = useState({ ...currentUser });
  const [newProject, setNewProject] = useState({ title: '', description: '', project_link: '', github_link: '', image_url: '' });
  const [editingProject, setEditingProject] = useState(null);
  const [newExperience, setNewExperience] = useState({ title: '', company: '', duration: '', description: '' });
  const [editingExperience, setEditingExperience] = useState(null);
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', year: '' });
  const [editingEducation, setEditingEducation] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const currentId = currentUser?._id || currentUser?.id;
        const targetId = id || currentId;
        
        if (!targetId) {
          setLoading(false);
          return;
        }

        const visitorMode = id && id !== currentId;
        setIsVisitor(visitorMode);

        if (visitorMode) {
          // Public profile view
          const res = await API.get(`/users/${id}`);
          const data = res.data.data;
          setProfileUser(data);
          setPortfolio(data.portfolio || []);
          setEndorsements(data.endorsements || []);
          setReviews(data.reviews || []);
          setMySkills(data.skills || []);
          setIsBlocked(currentUser?.blockedUsers?.includes(id));
        } else {
          // My own private profile view
          setProfileUser(currentUser);
          const [portfolioRes, endorseRes, reviewRes, skillsRes] = await Promise.all([
            API.get('/portfolio'),
            API.get('/endorsements/all'), 
            API.get('/reviews/my'),
            API.get('/skills')
          ]);
          setPortfolio(portfolioRes.data.data || []);
          setEndorsements(endorseRes.data.data || []);
          setReviews(reviewRes.data.data || []);
          const allSkills = skillsRes.data.data || skillsRes.data || [];
          setMySkills(allSkills.filter(s => {
            const sid = s.user_id?._id || s.user_id;
            return sid?.toString() === (currentUser?._id || currentUser?.id)?.toString();
          }));
          setExperience(currentUser.experience || []);
          setEducation(currentUser.education || []);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchProfileData();
  }, [id, currentUser?._id, currentUser?.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put('/users/profile', editUser);
      login(localStorage.getItem('token'), res.data.data); 
      setProfileUser(res.data.data);
      setShowEditModal(false);
      alert('Student profile updated successfully!');
    } catch (err) { console.error(err); }
  };
  
  const handleExpSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedExp;
      if (editingExperience !== null) {
        updatedExp = experience.map((exp, i) => i === editingExperience ? newExperience : exp);
      } else {
        updatedExp = [...experience, newExperience];
      }
      const res = await API.put('/users/profile', { experience: updatedExp });
      login(localStorage.getItem('token'), res.data.data);
      setExperience(updatedExp);
      setNewExperience({ title: '', company: '', duration: '', description: '' });
      setEditingExperience(null);
      setShowExpModal(false);
    } catch (err) { console.error(err); }
  };

  const handleEditExperience = (idx) => {
    setNewExperience(experience[idx]);
    setEditingExperience(idx);
    setShowExpModal(true);
  };

  const handleDeleteExperience = async (idx) => {
    if (!window.confirm('Delete this experience entry?')) return;
    try {
      const updatedExp = experience.filter((_, i) => i !== idx);
      const res = await API.put('/users/profile', { experience: updatedExp });
      login(localStorage.getItem('token'), res.data.data);
      setExperience(updatedExp);
    } catch (err) { console.error(err); }
  };

  const handleEduSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedEdu;
      if (editingEducation !== null) {
        updatedEdu = education.map((edu, i) => i === editingEducation ? newEducation : edu);
      } else {
        updatedEdu = [...education, newEducation];
      }
      const res = await API.put('/users/profile', { education: updatedEdu });
      login(localStorage.getItem('token'), res.data.data);
      setEducation(updatedEdu);
      setNewEducation({ school: '', degree: '', year: '' });
      setEditingEducation(null);
      setShowEduModal(false);
    } catch (err) { console.error(err); }
  };

  const handleEditEducation = (idx) => {
    setNewEducation(education[idx]);
    setEditingEducation(idx);
    setShowEduModal(true);
  };

  const handleDeleteEducation = async (idx) => {
    if (!window.confirm('Delete this education entry?')) return;
    try {
      const updatedEdu = education.filter((_, i) => i !== idx);
      const res = await API.put('/users/profile', { education: updatedEdu });
      login(localStorage.getItem('token'), res.data.data);
      setEducation(updatedEdu);
    } catch (err) { console.error(err); }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const res = await API.put(`/portfolio/${editingProject}`, newProject);
        setPortfolio(portfolio.map(p => p._id === editingProject ? res.data.data : p));
      } else {
        const res = await API.post('/portfolio', newProject);
        setPortfolio([...portfolio, res.data.data]);
      }
      setNewProject({ title: '', description: '', project_link: '', github_link: '', image_url: '' });
      setEditingProject(null);
      setShowProjectModal(false);
    } catch (err) { console.error(err); }
  };

  const handleEditProject = (p) => {
    setNewProject({ 
      title: p.title, 
      description: p.description, 
      project_link: p.project_link, 
      github_link: p.github_link,
      image_url: p.image_url || ''
    });
    setEditingProject(p._id);
    setShowProjectModal(true);
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
    } catch (err) {}
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this technical contribution?')) return;
    try {
      await API.delete(`/portfolio/${id}`);
      setPortfolio(portfolio.filter(p => (p._id || p.id) !== id));
    } catch (err) { console.error(err); }
  };

  const openAddSkill = () => {
    setEditingSkill(null);
    setSkillForm({ skill_name: '', category: '', proficiency_level: 'beginner', description: '', type: 'offer' });
    setShowSkillModal(true);
  };

  const openEditSkill = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      skill_name: skill.skill_name,
      category: skill.category || '',
      proficiency_level: skill.proficiency_level || 'beginner',
      description: skill.description || '',
      type: skill.type || 'offer',
    });
    setShowSkillModal(true);
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        const res = await API.put(`/skills/${editingSkill._id || editingSkill.id}`, skillForm);
        setMySkills(mySkills.map(s => (s._id || s.id) === (editingSkill._id || editingSkill.id) ? res.data.data : s));
      } else {
        const res = await API.post('/skills', skillForm);
        setMySkills([...mySkills, res.data.data]);
      }
      setShowSkillModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!window.confirm(`Remove "${skill.skill_name}" from your profile?`)) return;
    try {
      await API.delete(`/skills/${skill._id || skill.id}`);
      setMySkills(mySkills.filter(s => (s._id || s.id) !== (skill._id || skill.id)));
    } catch (err) {
      alert('Failed to delete skill');
    }
  };

  const handleToggleBlock = async () => {
    try {
      const res = await API.put(`/users/profile/block/${id}`);
      setIsBlocked(!isBlocked);
      alert(res.data.message);
    } catch (err) {
      alert('Failed to update block status');
    }
  };

  if (loading) return (
    <div className="page" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-premium"></div>
      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#94a3b8' }}>Syncing student credentials...</p>
    </div>
  );

  // Define these for UI consistency
  const pendingItems = endorsements.filter(e => !e.validated); 
  const activeItems = endorsements.filter(e => e.validated);

  return (
    <div className="page profile-page">
      {/* 1. Hero Student Spotlight */}
      <div className="profile-hero">
        <div className="hero-bg"></div>
        <div className="hero-details">
          <div className="avatar-wrapper">
             <div className="avatar-lg-v2">{profileUser?.name?.[0]}</div>
          </div>
          <div className="user-main-info">
            <h2 
               title="Verified Student Portfolio" 
               style={{ 
                 color: '#ffffff', 
                 fontSize: '2.8rem', 
                 fontWeight: 950, 
                 letterSpacing: '-2px', 
                 marginBottom: '0.6rem',
                 textShadow: '0 4px 12px rgba(0,0,0,0.3)' 
               }}
            >
               {profileUser?.name}
            </h2>
            <div className="hero-badges">
               <span className="user-title-badge"><Award size={16} /> RISING TALENT</span>
               {profileUser?.college && (
                 <span className="user-title-badge" style={{ background: '#eff6ff', color: '#2b6777', borderColor: '#dbeafe' }}>
                   <MapPin size={14} /> {profileUser.college.toUpperCase()}
                 </span>
               )}
               <span className="user-title-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#f1f5f9' }}>
                 <Check size={14} /> VERIFIED STUDENT
               </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: '500', maxWidth: '700px', lineHeight: 1.6 }}>
               {profileUser?.bio || "Crafting technical solutions and learning through peer collaboration. Connect with me for skill exchange!"}
            </p>
          </div>
          {!isVisitor && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', paddingTop: '1rem' }}>
              <button className="icon-btn secondary" onClick={() => setShowEditModal(true)} title="Edit Profile">
                <Pencil size={20} />
              </button>
            </div>
          )}
          {isVisitor && (
            <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start', paddingTop: '1rem' }}>
              <button 
                className={`icon-btn ${isBlocked ? 'primary' : 'danger'}`} 
                onClick={handleToggleBlock} 
                title={isBlocked ? "Unblock User" : "Block User"}
                style={{ width: 'auto', padding: '0 1.5rem', height: '42px', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <X size={20} /> {isBlocked ? 'UNBLOCK' : 'BLOCK'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Profile Grid */}
      <div className="profile-layout-v2">
        <aside className="sidebar-glass">
           <div className="sidebar-card">
              <h3><Mail size={18} /> Credentials</h3>
              <h3 className="section-header" style={{ marginBottom: '2rem' }}><Clock size={18} /> Reputation Pulse</h3>
              <div className="contact-row"><Mail size={18} /> {profileUser?.email}</div>
              <div className="contact-row"><Building size={18} /> {profileUser?.college || 'University Partner'}</div>
              <div className="contact-row"><GraduationCap size={18} /> {profileUser?.year || '2024'} Year</div>
              <div className="contact-row" style={{ marginTop: '1.5rem', color: '#2b6777' }}>
                {profileUser?.github_url && <a href={profileUser.github_url} target="_blank" rel="noreferrer" className="icon-btn secondary" style={{ marginRight: '0.75rem' }}><Github size={20} /></a>}
                {profileUser?.linkedin_url && <a href={profileUser.linkedin_url} target="_blank" rel="noreferrer" className="icon-btn secondary"><Linkedin size={20} /></a>}
              </div>
           </div>

           <div className="sidebar-card">
              <h3><Award size={18} /> Competencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                 {mySkills.length === 0 ? <p className="bio-text" style={{ fontSize: '0.85rem' }}>No competencies listed.</p> : 
                   mySkills.map(s => (
                     <span key={s._id || s.id} className="category-tag" style={{ border: '1px solid #f1f5f9', fontWeight: 900 }}>
                       {s.skill_name.toUpperCase()}
                     </span>
                   ))
                 }
              </div>
           </div>

           <div className="sidebar-card">
              <h3><Zap size={18} /> Analytics</h3>
              <div className="stat-ring-grid">
               <div className="stat-item-v2">
                  <span className="stat-val-v2">{reviews.length}</span>
                  <span className="stat-lab-v2">Reviews</span>
               </div>
               <div className="stat-item-v2">
                  <span className="stat-val-v2">{endorsements.length}</span>
                  <span className="stat-lab-v2">Badges</span>
               </div>
              </div>
           </div>
        </aside>

        <main className="content-glass">
            <nav className="tab-nav-v2">
               <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}>Contributions</button>
               <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>Skills Hub</button>
               <button className={activeTab === 'experience' ? 'active' : ''} onClick={() => setActiveTab('experience')}>Experience</button>
               <button className={activeTab === 'education' ? 'active' : ''} onClick={() => setActiveTab('education')}>Education</button>
               <button className={activeTab === 'validations' ? 'active' : ''} onClick={() => setActiveTab('validations')}>Validations</button>
               <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reputation</button>
            </nav>

            <div className="tab-pane">
                {activeTab === 'portfolio' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                       <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>FEATURED CONTRIBUTIONS</div>
                       {!isVisitor && <button className="add-btn" onClick={() => setShowProjectModal(true)} style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.85rem' }}><Plus size={20} /> NEW ENTRY</button>}
                    </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                       {portfolio.length === 0 ? <div className="empty-box" style={{ width: '100%', gridColumn: '1 / -1' }}>No clinical prototypes added yet. Spotlight your hard work!</div> : 
                         portfolio.map(p => (
                            <div className="project-card-v2" key={p._id || p.id}>
                               <div className="project-thumb" style={{ backgroundImage: `url(${p.image_url || MOCK_PROJECT_THUMB})` }}>
                                  {!isVisitor && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.4rem' }}>
                                      <button 
                                        onClick={() => handleEditProject(p)} 
                                        className="icon-btn info" 
                                        style={{ width: '34px', height: '34px' }}
                                        title="Edit Entry"
                                      >
                                        <Pencil size={15} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteProject(p._id || p.id)} 
                                        className="icon-btn danger" 
                                        style={{ width: '34px', height: '34px' }}
                                        title="Delete Entry"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  )}
                               </div>
                               <div className="project-body-v2">
                                  <h4 style={{ textTransform: 'uppercase' }}>{p.title}</h4>
                                  <p>{p.description || "Experimental prototype showcasing technical implementation and problem-solving skills."}</p>
                                  
                                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f8fafc' }}>
                                    {p.project_link && (
                                      <a href={p.project_link} target="_blank" rel="noreferrer" className="icon-btn primary" style={{ width: 'auto', padding: '0 1rem', fontSize: '0.75rem', fontWeight: 950, gap: '0.5rem', borderRadius: '10px' }}>
                                        <Globe size={14} /> DEMO
                                      </a>
                                    )}
                                    {p.github_link && (
                                      <a href={p.github_link} target="_blank" rel="noreferrer" className="icon-btn secondary" style={{ width: 'auto', padding: '0 1rem', fontSize: '0.75rem', fontWeight: 950, gap: '0.5rem', borderRadius: '10px' }}>
                                        <Github size={14} /> CODE
                                      </a>
                                    )}
                                  </div>
                               </div>
                            </div>
                         ))
                       }
                     </div>
                  </div>
               )}

                {activeTab === 'skills' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>{isVisitor ? 'HURRICANE TALENT' : 'TECHNICAL STACK'}</div>
                      {!isVisitor && <button className="add-btn" onClick={openAddSkill} style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.85rem' }}><Plus size={20} /> ADD SKILL</button>}
                    </div>

                    <div className="skills-grid-premium">
                      {mySkills.length === 0 ? (
                        <div className="empty-box" style={{ width: '100%', gridColumn: '1 / -1' }}>No skills published yet. Build your stack!</div>
                      ) : (
                        mySkills.map(skill => (
                          <SkillCard 
                            key={skill._id || skill.id} 
                            skill={skill} 
                            currentUser={currentUser} 
                            onDelete={() => handleDeleteSkill(skill)} 
                            onEdit={() => openEditSkill(skill)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>PROFESSIONAL JOURNEY</div>
                      {!isVisitor && <button className="add-btn" onClick={() => setShowExpModal(true)} style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.85rem' }}><Plus size={20} /> NEW ENTRY</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {experience.length === 0 ? <div className="empty-box">No professional experiences shared yet.</div> : 
                        experience.map((exp, idx) => (
                          <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                             <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building size={24} /></div>
                                <div>
                                   <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#1e293b' }}>{exp.title}</div>
                                   <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>{exp.company} • {exp.duration}</div>
                                   <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>{exp.description}</p>
                                </div>
                             </div>
                             {!isVisitor && (
                               <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 <button onClick={() => handleEditExperience(idx)} className="icon-btn info" style={{ height: '36px', width: '36px' }}><Pencil size={16} /></button>
                                 <button onClick={() => handleDeleteExperience(idx)} className="icon-btn danger" style={{ height: '36px', width: '36px' }}><Trash2 size={16} /></button>
                               </div>
                             )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>ACADEMIC BACKGROUND</div>
                      {!isVisitor && <button className="add-btn" onClick={() => setShowEduModal(true)} style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontSize: '0.85rem' }}><Plus size={20} /> NEW ENTRY</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {education.length === 0 ? <div className="empty-box">No educational background added.</div> : 
                        education.map((edu, idx) => (
                          <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                             <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <div style={{ background: '#fef3c7', color: '#d97706', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GraduationCap size={24} /></div>
                                <div>
                                   <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#1e293b' }}>{edu.degree}</div>
                                   <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, marginBottom: '0.2rem' }}>{edu.school}</div>
                                   <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Class of {edu.year}</div>
                                </div>
                             </div>
                             {!isVisitor && (
                               <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 <button onClick={() => handleEditEducation(idx)} className="icon-btn info" style={{ height: '36px', width: '36px' }}><Edit2 size={16} /></button>
                                 <button onClick={() => handleDeleteEducation(idx)} className="icon-btn danger" style={{ height: '36px', width: '36px' }}><Trash2 size={16} /></button>
                               </div>
                             )}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

               {activeTab === 'validations' && (
                 <div className="validations-v2">
                    <h3 className="section-header" style={{ color: '#3d8b7a', marginBottom: '2rem' }}><Zap size={18} /> Active Partnerships ({activeItems.filter(r => r.status !== 'completed').length})</h3>
                    <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '2.5rem' }}>PEER ENDORSEMENTS</div>
                    {endorsements.length === 0 ? <div className="empty-box">Peer validations help build trust. Collaborate to get endorsed!</div> : 
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {endorsements.map(e => (
                          <div key={e.id} className="validation-card-v2">
                             <div className="avatar-xs" style={{ width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0 }}>
                               {e.endorser?.name?.[0] || 'U'}
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                   <div>
                                     <div style={{ fontSize: '1rem', fontWeight: '950', color: '#1e293b' }}>{e.endorser?.name || 'Fellow Peer'}</div>
                                     <div className="user-subline">Verified Achievement</div>
                                   </div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', background: '#ecfdf5', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950 }}>
                                      <Zap size={12} fill="#059669" /> VALIDATED
                                   </div>
                                </div>
                                <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>"{e.comment || "Consistently demonstrated excellence in this technical area during our recent collaboration session."}"</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    }
                 </div>
               )}

               {activeTab === 'reviews' && (
                 <div className="reviews-v2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                       <div className="section-header" style={{ fontSize: '1.2rem', letterSpacing: '0.1em' }}>REPUTATION & REVIEWS</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fffbeb', padding: '0.6rem 1.25rem', borderRadius: '16px', border: '2px solid #fef3c7' }}>
                          <Star size={24} color="#f59e0b" fill="#f59e0b" />
                          <span style={{ fontWeight: 950, color: '#92400e', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'NEW'}
                          </span>
                       </div>
                    </div>
                    {reviews.length === 0 ? <div className="empty-box">No clinical reviews yet. Earn trust by completing collaborations!</div> : 
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                        {reviews.map(r => (
                          <div key={r.id || r._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                               <div style={{ width: '36px', height: '36px', background: '#f8fafc', color: '#1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                 {(r.reviewer?.name || r.reviewer_id?.name)?.[0] || 'U'}
                               </div>
                               <div>
                                 <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{r.reviewer?.name || r.reviewer_id?.name || 'Anonymous User'}</div>
                                 <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', marginTop: '2px' }}>
                                   {[...Array(5)].map((_, i) => (
                                     <Star key={i} size={14} fill={i < r.rating ? '#f59e0b' : 'none'} color={i < r.rating ? '#f59e0b' : '#e2e8f0'} />
                                   ))}
                                 </div>
                               </div>
                             </div>
                             <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7', fontStyle: 'italic', position: 'relative', paddingLeft: '1.5rem' }}>
                                <span style={{ position: 'absolute', left: 0, top: 0, fontSize: '2rem', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>"</span>
                                {r.comment || "Outstanding partner to work with. Very knowledgeable and clear with communication."}
                                <span style={{ fontSize: '2rem', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif", lineHeight: 0, verticalAlign: 'middle', marginLeft: '0.2rem' }}>"</span>
                             </p>
                          </div>
                        ))}
                      </div>
                    }
                 </div>
               )}
            </div>
        </main>
      </div>

      {/* Modals remain mostly same but use premium classes */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
                <h2 style={{ fontSize: '1.8rem' }}>Spotlight Configuration</h2>
                <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
             </div>
             <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-field">
                   <label>Student Full Name</label>
                   <input type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="input-premium" required />
                </div>
                <div className="form-field">
                   <label>Narrative / Bio</label>
                   <textarea value={editUser.bio || ''} onChange={e => setEditUser({...editUser, bio: e.target.value})} className="textarea-premium" rows={4} placeholder="Describe your technical journey..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="form-field">
                      <label>College / University</label>
                      <input type="text" value={editUser.college || ''} onChange={e => setEditUser({...editUser, college: e.target.value})} className="input-premium" />
                   </div>
                   <div className="form-field">
                      <label>Academic Year</label>
                      <input type="text" value={editUser.year || ''} onChange={e => setEditUser({...editUser, year: e.target.value})} className="input-premium" placeholder="e.g. 2024" />
                   </div>
                </div>
                <div className="form-field">
                   <label>Department / Major</label>
                   <input type="text" value={editUser.department || ''} onChange={e => setEditUser({...editUser, department: e.target.value})} className="input-premium" placeholder="e.g. Computer Science" />
                </div>
                <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Check size={22} /> SYNC IDENTITY</button>
             </form>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="modal-header">
                 <h2 style={{ fontSize: '1.8rem' }}>{editingProject ? 'Refine Spotlight' : 'New Technical Entry'}</h2>
                 <button className="close-btn" onClick={() => { setShowProjectModal(false); setEditingProject(null); }}><X size={20} /></button>
              </div>
              <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="form-field">
                    <label>Entry Title</label>
                    <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="input-premium" placeholder="e.g. Neural Nexus Pipeline" required />
                 </div>
                 <div className="form-field">
                    <label>Implementation Details</label>
                    <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="textarea-premium" rows={3} placeholder="Architecture, technologies, and results..." required />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-field">
                       <label>Demo Artifact URL</label>
                       <input type="url" value={newProject.project_link} onChange={e => setNewProject({...newProject, project_link: e.target.value})} className="input-premium" placeholder="https://live-demo.xyz" />
                    </div>
                    <div className="form-field">
                       <label>Source Control URL</label>
                       <input type="url" value={newProject.github_link} onChange={e => setNewProject({...newProject, github_link: e.target.value})} className="input-premium" placeholder="https://github.com/..." />
                    </div>
                 </div>
                 <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Plus size={22} /> PUBLISH TO PORTFOLIO</button>
              </form>
           </div>
        </div>
      )}

      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSkill ? 'Configuration' : 'Technical Inventory'}</h2>
              <button className="close-btn" onClick={() => setShowSkillModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-field">
                <label>Technical Competency</label>
                <input type="text" value={skillForm.skill_name} onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})} className="input-premium" placeholder="e.g. Distributed Systems" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-field">
                  <label>Domain</label>
                  <input type="text" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} className="input-premium" placeholder="e.g. Backend" />
                </div>
                <div className="form-field">
                  <label>Expertise</label>
                  <select value={skillForm.proficiency_level} onChange={e => setSkillForm({...skillForm, proficiency_level: e.target.value})} className="input-premium">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Engagement Type</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['offer', 'request'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 950, color: skillForm.type === t ? '#2b6777' : '#94a3b8' }}>
                      <input type="radio" name="type" value={t} checked={skillForm.type === t} onChange={e => setSkillForm({...skillForm, type: e.target.value})} style={{ transform: 'scale(1.2)' }} />
                      {t === 'offer' ? <Handshake size={16} /> : <Search size={16} />}
                      {t === 'offer' ? 'PROVIDER' : 'LEARNER'}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}>
                <Check size={20} /> {editingSkill ? 'UPDATE INVENTORY' : 'ADD TO HUB'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showExpModal && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="modal-header">
                 <h2 style={{ fontSize: '1.8rem' }}>{editingExperience !== null ? 'Modify Experience Node' : 'New Experience Node'}</h2>
                 <button className="close-btn" onClick={() => { setShowExpModal(false); setEditingExperience(null); }}><X size={20} /></button>
              </div>
              <form onSubmit={handleExpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="form-field">
                    <label>Position Title</label>
                    <input type="text" value={newExperience.title} onChange={e => setNewExperience({...newExperience, title: e.target.value})} className="input-premium" placeholder="e.g. Frontend Intern" required />
                 </div>
                 <div className="form-field">
                    <label>Organization / Company</label>
                    <input type="text" value={newExperience.company} onChange={e => setNewExperience({...newExperience, company: e.target.value})} className="input-premium" placeholder="e.g. Tech Corp" required />
                 </div>
                 <div className="form-field">
                    <label>Duration</label>
                    <input type="text" value={newExperience.duration} onChange={e => setNewExperience({...newExperience, duration: e.target.value})} className="input-premium" placeholder="e.g. June 2023 - Aug 2023" required />
                 </div>
                 <div className="form-field">
                    <label>Key Achievements</label>
                    <textarea value={newExperience.description} onChange={e => setNewExperience({...newExperience, description: e.target.value})} className="textarea-premium" rows={3} placeholder="Describe your impact..." required />
                 </div>
                 <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Plus size={22} /> ADD EXPERIENCE</button>
              </form>
           </div>
        </div>
      )}

      {showEduModal && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="modal-header">
                 <h2 style={{ fontSize: '1.8rem' }}>{editingEducation !== null ? 'Refine Academic Credentials' : 'New Academic Node'}</h2>
                 <button className="close-btn" onClick={() => { setShowEduModal(false); setEditingEducation(null); }}><X size={20} /></button>
              </div>
              <form onSubmit={handleEduSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="form-field">
                    <label>Degree / Certification</label>
                    <input type="text" value={newEducation.degree} onChange={e => setNewEducation({...newEducation, degree: e.target.value})} className="input-premium" placeholder="e.g. B.Tech in CSE" required />
                 </div>
                 <div className="form-field">
                    <label>Institution</label>
                    <input type="text" value={newEducation.school} onChange={e => setNewEducation({...newEducation, school: e.target.value})} className="input-premium" placeholder="e.g. Amrita University" required />
                 </div>
                 <div className="form-field">
                    <label>Class of (Year)</label>
                    <input type="text" value={newEducation.year} onChange={e => setNewEducation({...newEducation, year: e.target.value})} className="input-premium" placeholder="e.g. 2024" required />
                 </div>
                 <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Plus size={22} /> ADD EDUCATION</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
