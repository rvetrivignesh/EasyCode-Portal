import React, { useState, useEffect } from 'react';

interface Class {
  id: number;
  branch: string;
  batch: string;
  year: number;
  semester: number;
  created_at: string;
}

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        setError('Failed to fetch classes');
      }
    } catch (error) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/classes/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setClasses(classes.filter(cls => cls.id !== id));
        } else {
          setError('Failed to delete class');
        }
      } catch (error) {
        setError('Could not connect to server');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--secondary-text)]">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--primary-text)]">📚 All Classes</h2>
        <div className="text-sm text-[var(--secondary-text)]">
          Total: {classes.length} classes
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
          ❌ {error}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-8 text-center">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-lg font-medium text-[var(--primary-text)] mb-2">No Classes Yet</h3>
          <p className="text-[var(--secondary-text)]">Add your first class to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎓</span>
                    <h3 className="text-lg font-semibold text-[var(--primary-text)]">
                      {cls.branch} - Batch {cls.batch}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--secondary-text)]">Year:</span>
                      <span className="ml-2 text-[var(--primary-text)] font-medium">{cls.year}</span>
                    </div>
                    <div>
                      <span className="text-[var(--secondary-text)]">Semester:</span>
                      <span className="ml-2 text-[var(--primary-text)] font-medium">{cls.semester}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[var(--secondary-text)]">
                    Created: {new Date(cls.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteClass(cls.id)}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors duration-200 p-2 rounded-md hover:bg-red-50"
                  title="Delete class"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
