import React from 'react';
import { User, Trash2 } from 'lucide-react';

function SkillCard({ skill, currentUser, onDelete }) {
  const isOwnSkill = currentUser && currentUser.id === skill.user_id;

  return (
    <div className="skill-card">
      {/* CARD TOP (IMAGE MATCH) */}
      <div className="card-top">
        <span className="type-tag">{skill.type.toUpperCase()}</span>
        <span className="category-tag">{skill.category.substring(0, 10).toUpperCase()}</span>
      </div>

      {/* CARD BODY (IMAGE MATCH) */}
      <div className="card-body">
        <h3>{skill.skill_name}</h3>
        <div className="proficiency-line">
          <User size={16} />
          <span>{skill.proficiency_level}</span>
        </div>
      </div>

      {/* CARD FOOTER (IMAGE MATCH - BOTTOM AVATAR AND TRASH) */}
      <div className="card-footer">
        <div className="user-info-sm">
          <div className="avatar-xs">
            {skill.user?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div className="user-meta">
            <span className="name">{skill.user?.name || 'Student'}</span>
            <span className="year">Student • {skill.user?.year || 'Unknown'}</span>
          </div>
        </div>
        
        {isOwnSkill && (
          <button className="btn-trash" onClick={() => onDelete(skill.id)}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SkillCard;
