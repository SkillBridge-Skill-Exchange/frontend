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
      <div className="card-top" style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.5rem' }}>
        <div className="stat-badge" style={{ background: '#f8fafc', fontWeight: 950, color: '#94a3b8', fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
          <GraduationCap size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} /> {String(student.year || '4TH').toUpperCase().replace(' YEAR', '')} YEAR
        </div>
      </div>

      <div className="card-body" style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="avatar-lg" style={{ 
            width: '60px', 
            height: '60px', 
            fontSize: '1.8rem', 
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
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.8px' }}>{student.name}</h3>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginTop: '0.1rem' }}>
              <Building size={12} color="#52ab98" /> {(student.college || 'University Partner').toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="description-text" style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500, lineHeight: 1.55, opacity: 0.9 }}>
            {student.bio || "Crafting technical solutions and learning through peer collaboration."}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
             <span className="category-tag" style={{ background: '#f0fdf9', color: '#0d9488', border: '1px solid #ccfbf1', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 950, fontSize: '0.65rem' }}>
                {(student.department || 'GENERAL').toUpperCase()}
             </span>
             <span className="category-tag" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 950, fontSize: '0.65rem' }}>
                <Zap size={10} fill="#64748b" style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} /> ACTIVE
             </span>
          </div>
        </div>
      </div>

      <div className="card-footer" style={{ borderTop: '2px solid #f8fafc', background: 'rgba(248, 250, 252, 0.5)', padding: '1rem 1.5rem', margin: 'auto -1.25rem -1.25rem', borderRadius: '0 0 24px 24px' }}>
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
            style={{ width: 'auto', padding: '0.75rem 1.25rem', height: 'auto', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 950, gap: '0.5rem', marginLeft: 'auto' }}
          >
            View Full Portfolio <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PortfolioCard;
