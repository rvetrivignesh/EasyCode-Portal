import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ isOpen, onClose }) => {
  const [collegeId, setCollegeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ college_id: collegeId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store student data in localStorage
        localStorage.setItem('student', JSON.stringify(data.student));
        localStorage.setItem('userType', 'student');
        
        // Navigate to student dashboard
        navigate('/student');
        onClose();
        setCollegeId('');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-modal
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] w-full max-w-md mx-4 transform transition-all duration-200 scale-100 focus-visible:ring-4 focus-visible:ring-[var(--highlight)] outline-none" tabIndex={-1}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--primary-text)]">
              🎓 Student Login
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--secondary-text)] hover:text-[var(--primary-text)] transition-colors duration-200 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 rounded-md text-sm bg-red-100 text-red-800">
                ❌ {error}
              </div>
            )}
            
            <div className="mb-4">
              <label
                htmlFor="college-id"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                College ID
              </label>
              <div className="mb-2 text-xs text-[var(--secondary-text)]">
                Format: 25F45A3307, 25F45A3302, etc.
              </div>
              <input
                type="text"
                id="college-id"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                placeholder="Enter your college ID (e.g., 25F45A3307)"
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[var(--secondary-text)] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[var(--highlight)] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--button)] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginModal;
