import React from 'react';
import { User, MapPin, Building, GraduationCap, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function PortfolioCard({ student }) {
  return (
    <div className="skill-card premium portfolio-card-enhanced">
      <div className="card-top">
        <span className="type-ribbon portfolio-ribbon" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1e40af', border: '1px solid #93c5fd' }}>
          <User size={14} /> STUDENT
        </span>
        <span className="category-pill">{(student.department || 'GENERAL').toUpperCase()}</span>
      </div>

      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="student-avatar-large">
            {student.name ? student.name[0].toUpperCase() : 'S'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-0.5px' }}>{student.name}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', fontWeight: 700 }}>
              <Building size={14} /> {student.college || 'University Partner'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {student.bio ? (
            <p className="description-text" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{student.bio}</p>
          ) : (
            <p className="description-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>No bio provided.</p>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
            <div className="student-meta-badge">
              <GraduationCap size={14} /> {student.year || '4th'} Year
            </div>
            {student.email && (
              <div className="student-meta-badge" style={{ background: '#f0fdf9', color: '#059669', border: '1px solid #d1fae5' }}>
                <MapPin size={14} /> Active
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer" style={{ borderTop: '2px solid #f1f5f9' }}>
        <div className="card-actions" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {student.github_url && (
              <a href={student.github_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary" title="GitHub Profile">
                <Github size={18} />
              </a>
            )}
            {student.linkedin_url && (
              <a href={student.linkedin_url} target="_blank" rel="noopener noreferrer" className="icon-btn secondary" title="LinkedIn Profile">
                <Linkedin size={18} />
              </a>
            )}
          </div>
          <Link to={`/profile/${student._id || student.id}`} className="portfolio-view-btn">
            View Portfolio <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PortfolioCard;
