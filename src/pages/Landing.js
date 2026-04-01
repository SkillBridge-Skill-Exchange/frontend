/**
 * Landing Page
 * =============
 * Public-facing hero page with animated sections and feature highlights.
 * Task Owner: B Rahul (UI/UX, Landing Page)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Users, MessageCircle, TrendingUp, Award, 
  Star, ArrowRight, Zap, Shield, BarChart3, Brain 
} from 'lucide-react';

const features = [
  { icon: <Brain size={28} />, title: 'AI Skill Matching', desc: 'Our cosine similarity engine matches you with the perfect collaborators based on complementary skills.' },
  { icon: <Users size={28} />, title: 'Peer Endorsements', desc: 'Get your skills validated by peers who\'ve worked with you. Build credibility through community trust.' },
  { icon: <MessageCircle size={28} />, title: 'In-App Chat', desc: 'Connect instantly with matched students. Discuss projects and plan collaborations in real-time.' },
  { icon: <Award size={28} />, title: 'Skill Badges', desc: 'Earn Beginner, Intermediate, and Expert badges that showcase your proficiency levels.' },
  { icon: <BarChart3 size={28} />, title: 'Activity Dashboard', desc: 'Track your progress with interactive charts showing in-demand skills and contribution metrics.' },
  { icon: <Star size={28} />, title: 'Reviews & Ratings', desc: 'Rate collaborators after projects. Build a reputation that attracts more opportunities.' },
];

const stats = [
  { value: '500+', label: 'Active Students' },
  { value: '1,200+', label: 'Skills Listed' },
  { value: '350+', label: 'Collaborations' },
  { value: '95%', label: 'Match Accuracy' },
];

function Landing() {
  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`} />
          ))}
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} /> AI-Powered Skill Exchange
          </div>
          <h1>
            Find Your Perfect
            <span className="gradient-text"> Study Partner</span>
          </h1>
          <p className="hero-subtitle">
            SkillBridge connects students with complementary skills using AI-powered matching. 
            Collaborate, learn, and grow together on campus.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/skills" className="btn-hero-secondary">
              <Zap size={20} /> Explore Skills
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="mini-avatar" style={{ background: '#52ab98' }}>A</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>React Expert</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>96% Match</div>
            </div>
            <div className="match-ring" style={{ '--progress': '96%' }}>
              <span>96%</span>
            </div>
          </div>
          <div className="visual-card card-2">
            <div className="mini-avatar" style={{ background: '#2b6777' }}>S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Python ML</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>89% Match</div>
            </div>
            <div className="match-ring" style={{ '--progress': '89%' }}>
              <span>89%</span>
            </div>
          </div>
          <div className="visual-card card-3">
            <div className="mini-avatar" style={{ background: '#e67e22' }}>M</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>UI/UX Design</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>82% Match</div>
            </div>
            <div className="match-ring" style={{ '--progress': '82%' }}>
              <span>82%</span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar">
        {stats.map((stat, i) => (
          <div key={i} className="stat-item">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES GRID */}
      <section className="features-section">
        <div className="section-intro">
          <h2>Everything You Need to <span className="gradient-text">Collaborate</span></h2>
          <p>Powerful features designed to make campus skill exchange seamless and productive.</p>
        </div>
        <div className="features-grid">
          {features.map((feat, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-intro">
          <h2>How <span className="gradient-text">SkillBridge</span> Works</h2>
          <p>Three simple steps to start collaborating with peers.</p>
        </div>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>List Your Skills</h3>
            <p>Share what you're great at and what you want to learn. Set your proficiency level to get matched accurately.</p>
          </div>
          <div className="step-connector"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Get AI Matches</h3>
            <p>Our cosine similarity engine analyzes skill vectors and suggests the best collaborators for you.</p>
          </div>
          <div className="step-connector"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Collaborate & Grow</h3>
            <p>Send requests, chat in real-time, work on projects together, and rate each other after completion.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <Shield size={48} style={{ color: '#52ab98', marginBottom: '1rem' }} />
          <h2>Ready to Bridge the Skill Gap?</h2>
          <p>Join 500+ students already collaborating on campus. Your next great project starts here.</p>
          <Link to="/register" className="btn-hero-primary" style={{ display: 'inline-flex' }}>
            Join SkillBridge <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SkillBridge</h3>
            <p>AI-powered campus skill exchange platform</p>
          </div>
          <div className="footer-links">
            <span>Created for SkillBridge Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
