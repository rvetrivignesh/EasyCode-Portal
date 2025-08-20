import React, { useState, useEffect } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
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
    console.log('Admin login:', { email, password });
    onClose();
    setEmail('');
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-[var(--background)] rounded-lg shadow-2xl border border-[var(--secondary-text)] w-full max-w-md mx-4 transform transition-all duration-200 scale-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--primary-text)]">
              👨‍💼 Admin Login
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
                htmlFor="admin-email"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
                placeholder="Enter your admin email"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="admin-password"
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
                className="flex-1 bg-[var(--button)] text-white py-2 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 font-medium"
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

export default AdminLoginModal;
