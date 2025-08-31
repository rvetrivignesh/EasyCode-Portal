import React, { useState, useEffect } from 'react';
import StudentsList from '../components/StudentsList';
import ExcelUpload from '../components/ExcelUpload';

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
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showUpload, setShowUpload] = useState(false);

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

  const deleteClass = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
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

  const handleClassClick = (cls: Class) => {
    setSelectedClass(cls);
    setShowUpload(false);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setShowUpload(false);
  };

  const handleShowUpload = (cls: Class, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedClass(cls);
    setShowUpload(true);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    // Refresh is handled by StudentsList component
  };

  const getClassDisplayName = (cls: Class) => {
    return `${cls.branch} - Batch ${cls.batch} (Year ${cls.year}, Sem ${cls.semester})`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--secondary-text)]">Loading classes...</div>
      </div>
    );
  }

  // Show Excel upload view
  if (showUpload && selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowUpload(false)}
            className="text-[var(--highlight)] hover:text-[var(--button)] transition-colors duration-200 font-medium"
          >
            ← Back to Students
          </button>
          <h2 className="text-2xl font-bold text-[var(--primary-text)]">
            📊 Upload Students for {getClassDisplayName(selectedClass)}
          </h2>
        </div>
        <ExcelUpload 
          classId={selectedClass.id.toString()} 
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    );
  }

  // Show students list for selected class
  if (selectedClass) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToClasses}
              className="text-[var(--highlight)] hover:text-[var(--button)] transition-colors duration-200 font-medium"
            >
              ← Back to Classes
            </button>
            <h2 className="text-2xl font-bold text-[var(--primary-text)]">
              👥 {getClassDisplayName(selectedClass)}
            </h2>
          </div>
          <button
            onClick={(e) => handleShowUpload(selectedClass, e)}
            className="bg-[var(--highlight)] text-white px-4 py-2 rounded-md hover:bg-[var(--button)] transition-colors duration-200 font-medium flex items-center gap-2"
          >
            📊 Upload Excel
          </button>
        </div>
        <StudentsList 
          classId={selectedClass.id.toString()}
          className={getClassDisplayName(selectedClass)}
        />
      </div>
    );
  }

  // Default view - show all classes
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => handleClassClick(cls)}
              className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🎓</span>
                    <h3 className="text-lg font-semibold text-[var(--primary-text)] group-hover:text-[var(--highlight)] transition-colors duration-200">
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
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => handleShowUpload(cls, e)}
                      className="text-xs bg-[var(--highlight)] text-white px-3 py-1 rounded-md hover:bg-[var(--button)] transition-colors duration-200"
                      title="Upload students"
                    >
                      📊 Upload
                    </button>
                    <span className="text-xs text-[var(--secondary-text)] flex items-center">
                      👥 Click to view students
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteClass(cls.id, e)}
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
