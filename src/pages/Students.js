import React, { useState, useEffect } from 'react';
import API from '../api';
import PortfolioCard from '../components/PortfolioCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, GraduationCap, Users, Sliders } from 'lucide-react';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    year: '',
  });
  const popularDepts = ['CSE', 'MECH', 'ECE', 'AI', 'DESIGN', 'BCA'];
  const { user } = useAuth();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', department: '' });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.department) params.append('department', filters.department);
      if (filters.year) params.append('year', filters.year);

      const res = await API.get(`/users?${params.toString()}`);
      console.log('Collaborate Response:', res.data);
      
      const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      
      // Separate our own portfolio from others
      const currentUserId = user?._id || user?.id;
      const filtered = raw.filter(s => {
        const studentId = s._id || s.id;
        return currentUserId && studentId ? String(studentId) !== String(currentUserId) : true;
      });
      setStudents(filtered);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters]);

  return (
    <div className="page students-page">
      <div className="explore-layout">
        
        <aside className="filters-sidebar">
          <div className="section-header">
            <Sliders size={20} /> SYNC COLLABORATORS
          </div>

          <div className="filter-group">
            <label><GraduationCap size={14} /> ACADEMIC BATCH</label>
            <div className="proficiency-pills">
              {['1', '2', '3', '4', 'PG'].map(y => (
                <button 
                  key={y}
                  onClick={() => setFilters({...filters, year: filters.year === y ? '' : y})}
                  className={`prof-pill ${filters.year === y ? 'active' : ''}`}
                >
                  {y === 'PG' ? 'PG' : `${y}RD YEAR`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label><Users size={14} /> MAJOR CLOUD</label>
            <div className="category-cloud">
               {popularDepts.map(dept => (
                 <button 
                   key={dept}
                   onClick={() => setFilters({...filters, department: filters.department === dept ? '' : dept})}
                   className={`cloud-tag ${filters.department === dept ? 'active' : ''}`}
                 >
                   {dept}
                 </button>
               ))}
            </div>
            <input 
              type="text" 
              name="department" 
              placeholder="Or type department..." 
              value={filters.department} 
              onChange={handleFilterChange} 
              style={{ marginTop: '0.8rem' }}
            />
          </div>

          <button className="btn-clear" onClick={() => setFilters({search:'', department:'', year:''})}>
             RESET PREFERENCES
          </button>
        </aside>

        <main className="explore-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem' }}>
             <Users size={32} color="var(--primary)" />
             <h1>Collaborate</h1>
          </div>
          <p>Connect with fellow students and browse through their technical portfolios.</p>
          
          <div className="premium-search">
            <Search className="search-icon" size={24} color="#64748b" />
            <input
              type="text"
              name="search"
              placeholder="Search collaborators by name, bio or skill set..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '0.05em' }}>
            {students.length} COLLABORATORS SYNCED ACROSS YOUR NETWORK
          </div>

          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Finding students...</div>
          ) : (
            <div className="skills-grid-premium">
              {students.map((student) => (
                <PortfolioCard key={student._id || student.id} student={student} />
              ))}
              {students.length === 0 && (
                <div className="empty-box">No student portfolios found matching your search.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Students;
