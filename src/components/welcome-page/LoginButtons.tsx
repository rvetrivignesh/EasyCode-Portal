// components/sections/LoginButtons.tsx
import React from "react";

interface LoginButtonsProps {
  onAdminClick: () => void;
  onStudentClick: () => void;
}

const LoginButtons: React.FC<LoginButtonsProps> = ({ onAdminClick, onStudentClick }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--primary-text)] mb-6">
        Choose Your Login Type
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <button
          onClick={onAdminClick}
          aria-label="Open Admin Login Modal"
          className="flex-1 bg-[var(--button)] text-white py-4 px-8 rounded-lg font-semibold text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          👨‍💼 Admin Login
        </button>
        <button
          onClick={onStudentClick}
          aria-label="Open Student Login Modal"
          className="flex-1 bg-[var(--highlight)] text-white py-4 px-8 rounded-lg font-semibold text-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--button)] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          🎓 Student Login
        </button>
      </div>
    </div>
  );
};

export default LoginButtons;
