import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, Github, Trash2, Plus, Star, Award, Mail, MapPin, Calendar } from 'lucide-react';

function Profile() {
  const [portfolio, setPortfolio] = useState([]);
  const [endorsements, setEndorsements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [newProject, setNewProject] = useState({ title: '', description: '', project_link: '', github_link: '' });
  const { user } = useAuth();

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

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/portfolio', newProject);
      setPortfolio([...portfolio, res.data.data]);
      setNewProject({ title: '', description: '', project_link: '', github_link: '' });
    } catch (err) { console.error(err); }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Remove this contribution?')) return;
    try {
      await API.delete(`/portfolio/${id}`);
      setPortfolio(portfolio.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="page" style={{ color: 'white', textAlign: 'center', paddingTop: '10rem' }}>Opening Student Identity...</div>;

  return (
    <div className="page profile-page">
      <div className="profile-hero">
        <div className="hero-bg"></div>
        <div className="hero-details">
          <div className="avatar-lg">{user?.name?.[0].toUpperCase()}</div>
          <div className="user-info-text">
            <h2>{user?.name}</h2>
            <p>Student at {user?.college} • {user?.department}</p>
          </div>
          <button className="btn-portrait">Modify Portrait</button>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-section">
            <h3>Campus Connect</h3>
            <div className="contact-row"><Mail size={20} color="#2b6777" /> {user?.email}</div>
            <div className="contact-row"><MapPin size={20} color="#2b6777" /> {user?.college}</div>
            <div className="contact-row"><Calendar size={20} color="#2b6777" /> {user?.year} Batch</div>
          </div>
          <div className="sidebar-section">
             <h3>Competencies</h3>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
               {mySkills.length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No competencies listed.</p> : 
                 mySkills.map(s => (
                   <span key={s.id} style={{ background: '#eff6ff', color: '#2b6777', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '950' }}>{s.skill_name.toUpperCase()}</span>
                 ))
               }
             </div>
          </div>
        </aside>

        <main className="profile-main">
           <nav className="tab-nav">
              <button className={activeTab === 'portfolio' ? 'active' : ''} onClick={() => setActiveTab('portfolio')}>Portfolio</button>
              <button className={activeTab === 'endorsements' ? 'active' : ''} onClick={() => setActiveTab('endorsements')}>Endorsements</button>
              <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Peer Insights</button>
           </nav>

           <div className="tab-pane">
              {activeTab === 'portfolio' && (
                <div className="portfolio-grid">
                   {portfolio.map(p => (
                     <div className="project-card" key={p.id}>
                        <h4>{p.title}</h4>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '1.05rem' }}>{p.description}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                           {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" style={{ color: '#2b6777', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Demo <ExternalLink size={16} /></a>}
                           {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" style={{ color: '#2b6777', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Code <Github size={16} /></a>}
                        </div>
                        <button onClick={() => handleDeleteProject(p.id)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                     </div>
                   ))}
                   <div className="project-card" style={{ border: '3.5px dashed #cbd5e1', background: 'white' }}>
                      <div style={{ color: '#2b6777', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', fontSize: '1.25rem' }}><Plus size={28} /> Add Contribution</div>
                      <form onSubmit={handleAddProject}>
                         <input type="text" placeholder="Project name" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} className="profile-input-premium" required />
                         <textarea placeholder="Describe your technical contributions and impact..." value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="profile-input-premium" rows={3} required />
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <input type="url" placeholder="Demo URL" value={newProject.project_link} onChange={e => setNewProject({...newProject, project_link: e.target.value})} className="profile-input-premium" />
                            <input type="url" placeholder="GitHub URL" value={newProject.github_link} onChange={e => setNewProject({...newProject, github_link: e.target.value})} className="profile-input-premium" />
                         </div>
                         <button type="submit" className="btn-publish-portfolio" style={{ width: '100%', padding: '1.3rem', marginTop: '1rem' }}>Add to Portfolio</button>
                      </form>
                   </div>
                </div>
              )}

              {activeTab === 'endorsements' && (
                <div style={{ background: 'white', padding: '4rem', borderRadius: '35px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                   {endorsements.length === 0 ? <p style={{ color: '#cbd5e1', fontWeight: '950' }}>No peer validations yet.</p> : 
                     endorsements.map(e => (
                       <div key={e.id} style={{ padding: '2.5rem', borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                          <p style={{ fontStyle: 'italic', fontSize: '1.3rem', fontWeight: '750', color: '#2b3a4a', lineHeight: 1.6 }}>"{e.comment}"</p>
                          <div style={{ marginTop: '1.5rem', fontWeight: '950', color: '#2b6777' }}>— {e.endorser.name} • Certified Peer</div>
                       </div>
                     ))
                   }
                </div>
              )}

              {activeTab === 'reviews' && (
                <div style={{ background: 'white', padding: '4rem', borderRadius: '35px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                    {reviews.length === 0 ? <p style={{ color: '#cbd5e1', fontWeight: '950' }}>Ready for initial collaboration.</p> : 
                      reviews.map(r => (
                        <div key={r.id} style={{ padding: '2.5rem', borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                           <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
                              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < r.rating ? "#52ab98" : "none"} stroke={i < r.rating ? "#52ab98" : "#cbd5e1"} />)}
                           </div>
                           <p style={{ color: '#64748b', fontSize: '1.15rem' }}>"{r.comment}"</p>
                           <div style={{ marginTop: '1.25rem', fontWeight: '950', color: '#2b6777' }}>— {r.reviewer.name}</div>
                        </div>
                      ))
                    }
                </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
