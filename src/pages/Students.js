import React, { useState, useEffect } from 'react';
import API from '../api';
import PortfolioCard from '../components/PortfolioCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, GraduationCap, Users } from 'lucide-react';
import '../explore.css';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
  });
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
            <Filter size={18} /> Student Filters
          </div>

          <div className="filter-group">
            <label>DEPARTMENT</label>
            <input 
              type="text" 
              name="department" 
              placeholder="e.g. CSE, Mechanical" 
              value={filters.department} 
              onChange={handleFilterChange} 
            />
          </div>

          <button className="btn-clear" onClick={clearFilters}>Reset Filters</button>
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
              placeholder="Search students by name, department or bio..."
              value={filters.search}
              onChange={handleFilterChange}
            />
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
