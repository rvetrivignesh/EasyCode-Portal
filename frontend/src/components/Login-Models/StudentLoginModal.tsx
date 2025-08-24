import React, { useState, useEffect } from 'react';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentLoginModal: React.FC<StudentLoginModalProps> = ({ isOpen, onClose }) => {
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [hallTicket, setHallTicket] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Student login:', { branch, year, semester, hallTicket, password });
    onClose();
    setBranch('');
    setYear('');
    setSemester('');
    setHallTicket('');
    setPassword('');
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
            <div className="mb-4">
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                Branch
              </label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="CSM">CSE (ARTIFICIAL INTELLIGENCE & MACHINE LEARNING)</option>
                <option value="CSD">CSE (DATA SCIENCE)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
                >
                  Year
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                  required
                >
                  <option value="">Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
                >
                  Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                  required
                >
                  <option value="">Sem</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="hall-ticket"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                Hall Ticket Number
              </label>
              <input
                type="text"
                id="hall-ticket"
                value={hallTicket}
                onChange={(e) => setHallTicket(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                placeholder="Enter your hall ticket number"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="student-password"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="student-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[var(--secondary-text)] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[var(--highlight)] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--button)] transition-all duration-200 font-medium"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLoginModal;
