/**
 * Ultra-Premium PortfolioCard Component
 * =====================================
 * State-of-the-art student passport/identity card format 
 * for elevated networking and discovery.
 */

import React from 'react';
import { 
    User, MapPin, Building, GraduationCap, Github, 
    Linkedin, ExternalLink, Zap, Award, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

function PortfolioCard({ student }) {
  return (
    <div className="skill-card portfolio-card premium-hover">
      <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem' }}>
        <span className="type-tag" style={{ background: 'rgba(43, 103, 119, 0.05)', color: 'var(--primary)', fontWeight: 950, letterSpacing: '0.05em' }}>
          PASSPORT <Sparkles size={10} style={{ verticalAlign: 'middle', marginLeft: '0.35rem' }} />
        </span>
        <div className="stat-badge" style={{ background: '#f8fafc', fontWeight: 950, color: '#94a3b8' }}>
          <GraduationCap size={14} /> {String(student.year || '4TH').toUpperCase()} YEAR
        </div>
      </div>

      <div className="card-body" style={{ marginTop: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="avatar-lg" style={{ 
            width: '72px', 
            height: '72px', 
            fontSize: '2.2rem', 
            border: '3px solid white', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #2b6777, #52ab98)',
            color: 'white',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {student.name ? student.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-1px' }}>{student.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
              <Building size={14} color="#52ab98" /> {(student.college || 'University Partner').toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="description-text" style={{ fontSize: '1rem', color: '#475569', fontWeight: 500, lineHeight: 1.6, opacity: 0.9 }}>
            {student.bio || "Crafting technical solutions and learning through peer collaboration."}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
             <span className="category-tag" style={{ background: '#f0fdf9', color: '#0d9488', border: '1px solid #ccfbf1', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 950 }}>
                {(student.department || 'GENERAL').toUpperCase()}
             </span>
             <span className="category-tag" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 950 }}>
                <Zap size={12} fill="#64748b" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> ACTIVE
             </span>
          </div>
        </div>
      </div>

      <div className="card-footer" style={{ borderTop: '2px solid #f8fafc', background: 'rgba(248, 250, 252, 0.5)', padding: '2rem', margin: '2rem -1.75rem -1.75rem', borderRadius: '0 0 30px 30px' }}>
        <div className="card-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            {student.github_url && (
              <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary" title="GitHub Forge">
                <Github size={20} />
              </a>
            )}
            {student.linkedin_url && (
              <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary" title="LinkedIn Workspace">
                <Linkedin size={20} />
              </a>
            )}
          </div>
          <Link 
            to={`/profile/${student._id}`} 
            className="icon-btn primary" 
            style={{ width: 'auto', padding: '0.85rem 1.75rem', height: 'auto', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 950, gap: '0.75rem' }}
          >
            VIEW PROFILE <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PortfolioCard;
