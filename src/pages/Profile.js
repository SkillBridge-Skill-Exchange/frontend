import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ExternalLink, Github, Trash2, Plus, Star, Award, Mail, MapPin, 
  Linkedin, Globe, Edit3, Camera, X, Check, Search, Calendar, ChevronRight
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
        setMySkills(allSkills.filter(s => s.user_id === user.id));
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
               <button className={activeTab === 'validations' ? 'active' : ''} onClick={() => setActiveTab('validations')}>Peer Validations</button>
            </nav>

            <div className="tab-pane">
               {activeTab === 'portfolio' && (
                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem' }}>Featured Projects</h3>
                      <button className="add-btn" onClick={() => setShowProjectModal(true)} style={{ padding: '0.5rem 1.25rem' }}><Plus size={20} /> New Entry</button>
                   </div>
                   <div className="portfolio-v2">
                     {portfolio.length === 0 ? <div className="empty-box" style={{ width: '100%', gridColumn: 'span 2' }}>Add your first project to the spotlight.</div> : 
                       portfolio.map(p => (
                         <div className="project-card-v2" key={p.id} style={{ position: 'relative' }}>
                            <div className="project-thumb" style={{ backgroundImage: `url(${MOCK_PROJECT_THUMB})` }}></div>
                            <div className="project-body-v2">
                               <h4>{p.title}</h4>
                               <p style={{ color: '#64748b', fontSize: '0.95rem', height: '3.6rem', overflow: 'hidden' }}>{p.description}</p>
                               <div className="project-tags">
                                  <span className="project-tag">REACT</span>
                                  <span className="project-tag">NODE.JS</span>
                                  <span className="project-tag">SQL</span>
                               </div>
                               <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', borderTop: '2px solid #f1f5f9', paddingTop: '1rem' }}>
                                  {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" style={{ color: '#2b6777', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Globe size={14} /> LIVE</a>}
                                  {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Github size={14} /> VIEW CODE</a>}
                               </div>
                            </div>
                            <button onClick={() => handleDeleteProject(p.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', zIndex: 5 }}><Trash2 size={16} /></button>
                         </div>
                       ))
                     }
                   </div>
                 </div>
               )}

               {activeTab === 'validations' && (
                 <div className="validations-v2">
                    <h3 style={{ fontWeight: 900, color: '#1e293b', fontSize: '1.4rem', marginBottom: '2rem' }}>Peer Endorsements</h3>
                    {endorsements.length === 0 ? <div className="empty-box">Peer validations help build trust. Collaborate to get endorsed!</div> : 
                      endorsements.map(e => (
                        <div key={e.id} style={{ background: '#fcfdfe', padding: '2rem', borderRadius: '25px', border: '2px solid #f1f5f9', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                           <div style={{ width: '44px', height: '44px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950 }}>{e.endorser.name[0]}</div>
                           <div style={{ flex: 1 }}>
                              <p style={{ fontStyle: 'italic', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>"{e.comment}"</p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#52ab98' }}>— {e.endorser.name}</span>
                                 <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Certified Skill Check</span>
                              </div>
                           </div>
                        </div>
                      ))
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
    </div>
  );
}

export default Profile;
