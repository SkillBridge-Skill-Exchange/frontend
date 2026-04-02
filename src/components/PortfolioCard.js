import React from 'react';
import { User, MapPin, Building, GraduationCap, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function PortfolioCard({ student }) {
  return (
    <div className="skill-card premium portfolio-card">
      <div className="card-top">
        <span className="type-ribbon active-offering" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={14} /> STUDENT PORTFOLIO
        </span>
        <span className="category-pill">{student.department || 'GENERAL'}</span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="avatar-lg" style={{ width: '60px', height: '60px', fontSize: '1.5rem', border: 'none', borderRadius: '16px', marginTop: '0' }}>
            {student.name ? student.name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{student.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={14} /> {student.college || 'University Partner'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
          {student.bio ? (
            <p className="description-text" style={{ fontSize: '0.9rem', WebkitLineClamp: 2 }}>{student.bio}</p>
          ) : (
            <p className="description-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>No bio provided.</p>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              <GraduationCap size={12} /> {student.year || '4th'} Year
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="card-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {student.github_url && (
              <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary">
                <Github size={18} />
              </a>
            )}
            {student.linkedin_url && (
              <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary">
                <Linkedin size={18} />
              </a>
            )}
          </div>
          <Link to={`/profile/${student._id}`} className="icon-btn primary" style={{ width: 'auto', padding: '0 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, gap: '0.5rem' }}>
            View Full Portfolio <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PortfolioCard;
