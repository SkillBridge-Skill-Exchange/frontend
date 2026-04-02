import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ExternalLink, Github, Trash2, Plus, Star, Award, Mail, MapPin, 
  Linkedin, Globe, Edit3, X, Check, Zap, BookOpen, Pencil
} from 'lucide-react';
import '../profile.css';

// Mock path for project thumbnails (you can replace with real uploaded images later)
const MOCK_PROJECT_THUMB = "file:///C:/Users/harin/.gemini/antigravity/brain/efb08790-66e8-45c9-b3e7-4c863894e111/project_mockup_1775055078149.png";

function Profile() {
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

  const { user, login } = useAuth();
  const [editUser, setEditUser] = useState({ ...user });
  const [newProject, setNewProject] = useState({ title: '', description: '', project_link: '', github_link: '' });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
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
        // MongoDB uses _id — filter by comparing string representations
        setMySkills(allSkills.filter(s => {
          const sid = s.user_id?._id || s.user_id;
          return sid?.toString() === (user._id || user.id)?.toString();
        }));
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchProfileData();
  }, [user.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you'd call API.put('/users/profile', editUser)
      // Since this is a prototype, we'll update the user in the context to simulate persistence
      login(localStorage.getItem('token'), editUser); 
      setShowEditModal(false);
      alert('Student profile updated successfully!');
    } catch (err) { console.error(err); }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/portfolio', newProject);
      setPortfolio([...portfolio, res.data.data]);
      setNewProject({ title: '', description: '', project_link: '', github_link: '' });
      setShowProjectModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this technical contribution?')) return;
    try {
      await API.delete(`/portfolio/${id}`);
      setPortfolio(portfolio.filter(p => p.id !== id));
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

  if (loading) return (
    <div className="page" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-premium"></div>
      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#94a3b8' }}>Syncing student credentials...</p>
    </div>
  );

  return (
    <div className="page profile-page">
      {/* 1. Hero Student Spotlight */}
      <div className="profile-hero">
        <div className="hero-bg"></div>
        <div className="hero-details">
          <div className="avatar-wrapper">
             <div className="avatar-lg-v2">{user?.name[0]}</div>
             {/* <div className="online-badge"></div> */}
          </div>
          <div className="user-main-info">
            <h2 title="Verified Student Portfolio">{user?.name}</h2>
            <div className="hero-actions">
               <span className="user-title-badge"><Award size={18} /> Rising Talent</span>
               <span className="user-title-badge" style={{ background: '#eff6ff', color: '#2b6777' }}><MapPin size={16} /> Bengaluru Campus</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: '500', maxWidth: '600px', lineHeight: 1.6 }}>
               {user?.bio || "No bio set. Showcase your student identity for better matches."}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
             <button className="btn-icon-action" onClick={() => setShowEditModal(true)} title="Customize Profile"><Edit3 size={24} /></button>
             <button className="btn-icon-action" title="Verify Badges"><Award size={24} /></button>
          </div>
        </div>
      </div>

      {/* 2. Main Profile Grid */}
      <div className="profile-layout-v2">
        <aside className="sidebar-glass">
           <div className="sidebar-card">
              <h3><Mail /> Student Credentials</h3>
              <div className="contact-row"><Mail size={18} /> {user?.email}</div>
              <div className="contact-row"><Globe size={18} /> Portfolio: {user?.year} Batch</div>
              <div className="contact-row" style={{ marginTop: '1.5rem', color: '#2b6777' }}>
                {user?.github_url && <a href={user.github_url} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}><Github /></a>}
                {user?.linkedin_url && <a href={user.linkedin_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', marginLeft: '1rem' }}><Linkedin /></a>}
              </div>
           </div>

           <div className="sidebar-card">
              <h3><Star /> Competencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                 {mySkills.length === 0 ? <p className="bio-text" style={{ fontSize: '0.85rem' }}>No skills listed.</p> : 
                   mySkills.map(s => (
                     <span key={s.id} style={{ background: '#f8fafc', color: '#475569', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '950', border: '1px solid #e2e8f0' }}>
                       {s.skill_name.toUpperCase()}
                       {s.proficiency_level === 'expert' && <Award size={14} style={{ marginLeft: '4px', color: '#f59e0b', verticalAlign: 'middle' }} />}
                     </span>
                   ))
                 }
              </div>
           </div>

           <div className="sidebar-card">
              <h3><Award /> Impact Analytics</h3>
              <div className="stat-ring-grid">
                 <div className="stat-item-v2">
                    <span className="stat-val-v2">{reviews.length}</span>
                    <span className="stat-lab-v2">Reviews</span>
                 </div>
                 <div className="stat-item-v2">
                    <span className="stat-val-v2">{endorsements.length}</span>
                    <span className="stat-lab-v2">Validations</span>
                 </div>
              </div>
           </div>
        </aside>

        <main className="content-glass">
            <nav className="tab-nav-v2">
               <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}>Contributions</button>
               <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>My Skills</button>
               <button className={activeTab === 'validations' ? 'active' : ''} onClick={() => setActiveTab('validations')}>Peer Validations</button>
               <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reputation</button>
            </nav>

            <div className="tab-pane">
               {activeTab === 'portfolio' && (
                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>Featured Projects</h3>
                      <button className="add-btn" onClick={() => setShowProjectModal(true)} style={{ padding: '0.5rem 1.25rem' }}><Plus size={20} /> New Entry</button>
                   </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                       {portfolio.length === 0 ? <div className="empty-box" style={{ width: '100%', gridColumn: '1 / -1' }}>Add your first project to the spotlight.</div> : 
                         portfolio.map(p => (
                           <div className="project-card-v2 premium-hover" key={p.id} style={{ position: 'relative', background: '#fff', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', transition: 'all 0.3s' }}>
                              <div className="project-thumb" style={{ backgroundImage: `url(${p.image_url || MOCK_PROJECT_THUMB})`, height: '160px', backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid #f1f5f9' }}></div>
                              <div className="project-body-v2" style={{ padding: '1.5rem' }}>
                                 <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{p.title}</h4>
                                 <p style={{ color: '#64748b', fontSize: '0.85rem', height: '3.8rem', overflow: 'hidden', lineHeight: '1.4' }}>{p.description}</p>
                                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                    {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" style={{ color: '#52ab98', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Globe size={14} /> LIVE</a>}
                                    {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Github size={14} /> CODE</a>}
                                 </div>
                              </div>
                              <button onClick={() => handleDeleteProject(p.id)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.95)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', zIndex: 5, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><Trash2 size={16} /></button>
                           </div>
                         ))
                       }
                     </div>
                 </div>
               )}

               {activeTab === 'skills' && (
                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                     <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>My Skills</h3>
                     <button className="add-btn" onClick={openAddSkill} style={{ padding: '0.5rem 1.25rem' }}><Plus size={20} /> Add Skill</button>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     {/* Offering Column */}
                     <div>
                       <div className="skills-col-header offering">
                         <Zap size={16} /> Offering
                       </div>
                       {mySkills.filter(s => s.type === 'offer').length === 0
                         ? <div className="empty-box" style={{ margin: '0.5rem 0' }}>No skills offered yet.</div>
                         : mySkills.filter(s => s.type === 'offer').map(skill => (
                           <div key={skill._id || skill.id} className="my-skill-row">
                             <div className="my-skill-info">
                               <span className="my-skill-name">{skill.skill_name}</span>
                               <span className={`proficiency-badge ${skill.proficiency_level}`}>{skill.proficiency_level}</span>
                               {skill.category && <span className="skill-category">{skill.category}</span>}
                             </div>
                             <div className="my-skill-actions">
                               <button onClick={() => openEditSkill(skill)} title="Edit" className="skill-action-btn edit"><Pencil size={14} /></button>
                               <button onClick={() => handleDeleteSkill(skill)} title="Delete" className="skill-action-btn delete"><Trash2 size={14} /></button>
                             </div>
                           </div>
                         ))
                       }
                     </div>

                     {/* Seeking Column */}
                     <div>
                       <div className="skills-col-header seeking">
                         <BookOpen size={16} /> Seeking
                       </div>
                       {mySkills.filter(s => s.type === 'request').length === 0
                         ? <div className="empty-box" style={{ margin: '0.5rem 0' }}>No skills requested yet.</div>
                         : mySkills.filter(s => s.type === 'request').map(skill => (
                           <div key={skill._id || skill.id} className="my-skill-row">
                             <div className="my-skill-info">
                               <span className="my-skill-name">{skill.skill_name}</span>
                               <span className={`proficiency-badge ${skill.proficiency_level}`}>{skill.proficiency_level}</span>
                               {skill.category && <span className="skill-category">{skill.category}</span>}
                             </div>
                             <div className="my-skill-actions">
                               <button onClick={() => openEditSkill(skill)} title="Edit" className="skill-action-btn edit"><Pencil size={14} /></button>
                               <button onClick={() => handleDeleteSkill(skill)} title="Delete" className="skill-action-btn delete"><Trash2 size={14} /></button>
                             </div>
                           </div>
                         ))
                       }
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === 'validations' && (
                 <div className="validations-v2">
                    <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem', marginBottom: '2rem' }}>Peer Endorsements</h3>
                    {endorsements.length === 0 ? <div className="empty-box">Peer validations help build trust. Collaborate to get endorsed!</div> : 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {endorsements.map(e => (
                          <div key={e.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                             <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', color: '#059669', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0, border: '1px solid #a7f3d0' }}>
                               {e.endorser?.name?.[0] || 'U'}
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                   <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#1e293b' }}>{e.endorser?.name || 'Unknown User'}</span>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#52ab98', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 900 }}>
                                      <Award size={12} /> ENDORSED SKILL
                                   </div>
                                </div>
                                <p style={{ fontStyle: 'italic', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>"{e.comment}"</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    }
                 </div>
               )}

               {activeTab === 'reviews' && (
                 <div className="reviews-v2">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>Reputation & Reviews</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff8f1', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                         <Star size={20} color="#f59e0b" fill="#f59e0b" />
                         <span style={{ fontWeight: 900, color: '#9a3412', fontSize: '1.1rem' }}>
                           {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'New'}
                         </span>
                      </div>
                    </div>
                    {reviews.length === 0 ? <div className="empty-box">No reviews yet. Complete collaborations to earn ratings!</div> : 
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {reviews.map(r => (
                          <div key={r.id || r._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                               <div style={{ width: '36px', height: '36px', background: '#f8fafc', color: '#1e293b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                 {r.reviewer?.name?.[0] || 'U'}
                               </div>
                               <div>
                                 <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{r.reviewer?.name || 'Anonymous User'}</div>
                                 <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', marginTop: '2px' }}>
                                   {[...Array(5)].map((_, i) => (
                                     <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'none'} color={i < r.rating ? '#f59e0b' : '#cbd5e1'} />
                                   ))}
                                 </div>
                               </div>
                             </div>
                             <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>"{r.comment}"</p>
                          </div>
                        ))}
                      </div>
                    }
                 </div>
               )}
            </div>
        </main>
      </div>

      {/* 3. Modal: Edit Profile */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
             <div className="modal-header">
                <h2>Custom Spotlight</h2>
                <button className="close-btn" onClick={() => setShowEditModal(false)}><X size={20} /></button>
             </div>
             <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-field">
                   <label>Student Identity</label>
                   <input type="text" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} className="input-premium" required />
                </div>
                <div className="form-field">
                   <label>Student Narrative (Bio)</label>
                   <textarea value={editUser.bio || ''} onChange={e => setEditUser({...editUser, bio: e.target.value})} className="textarea-premium" rows={4} placeholder="Describe your technical journey..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="form-field">
                      <label>GitHub Profile</label>
                      <input type="url" value={editUser.github_url || ''} onChange={e => setEditUser({...editUser, github_url: e.target.value})} className="input-premium" placeholder="https://github.com/yourhandle" />
                   </div>
                   <div className="form-field">
                      <label>LinkedIn Workspace</label>
                      <input type="url" value={editUser.linkedin_url || ''} onChange={e => setEditUser({...editUser, linkedin_url: e.target.value})} className="input-premium" placeholder="https://linkedin.com/in/handle" />
                   </div>
                </div>
                <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Check size={22} /> Save Final Identity</button>
             </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Add Project */}
      {showProjectModal && (
        <div className="modal-overlay">
           <div className="modal-content">
              <div className="modal-header">
                 <h2>New Technical Contribution</h2>
                 <button className="close-btn" onClick={() => setShowProjectModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div className="form-field">
                    <label>Contribution Title</label>
                    <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="input-premium" placeholder="e.g. Distributed Task Management" required />
                 </div>
                 <div className="form-field">
                    <label>Impact Statement</label>
                    <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="textarea-premium" rows={3} placeholder="What problem did you solve and what stack was used?" required />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-field">
                       <label>Proof of Demo (URL)</label>
                       <input type="url" value={newProject.project_link} onChange={e => setNewProject({...newProject, project_link: e.target.value})} className="input-premium" placeholder="https://demo-link.xyz" />
                    </div>
                    <div className="form-field">
                       <label>Respository Link (Git)</label>
                       <input type="url" value={newProject.github_link} onChange={e => setNewProject({...newProject, github_link: e.target.value})} className="input-premium" placeholder="https://github.com/..." />
                    </div>
                 </div>
                 <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}><Plus size={22} /> Commit to Portfolio</button>
              </form>
           </div>
        </div>
      )}

      {/* Skill Add/Edit Modal */}
      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
              <button className="close-btn" onClick={() => setShowSkillModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-field">
                <label>Skill Name *</label>
                <input type="text" value={skillForm.skill_name} onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})} className="input-premium" placeholder="e.g. React, Python, Figma" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field">
                  <label>Category</label>
                  <input type="text" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} className="input-premium" placeholder="e.g. Frontend, ML" />
                </div>
                <div className="form-field">
                  <label>Proficiency</label>
                  <select value={skillForm.proficiency_level} onChange={e => setSkillForm({...skillForm, proficiency_level: e.target.value})} className="input-premium">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Type *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['offer', 'request'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: skillForm.type === t ? '#52ab98' : '#64748b' }}>
                      <input type="radio" name="type" value={t} checked={skillForm.type === t} onChange={e => setSkillForm({...skillForm, type: e.target.value})} />
                      {t === 'offer' ? '⚡ Offering' : '🎓 Seeking'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={skillForm.description} onChange={e => setSkillForm({...skillForm, description: e.target.value})} className="textarea-premium" rows={3} placeholder="Briefly describe your experience with this skill..." />
              </div>
              <button type="submit" className="btn-publish" style={{ marginTop: '0.5rem' }}>
                <Check size={20} /> {editingSkill ? 'Save Changes' : 'Add Skill'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
