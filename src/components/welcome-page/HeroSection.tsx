import React from "react";

const HeroSection: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-5xl md:text-6xl font-bold text-[var(--primary-text)] mb-6 leading-tight">
        Welcome to
        <span className="block text-[var(--highlight)] mt-2">EasyCode Portal</span>
      </h1>
      <p className="text-xl md:text-2xl text-[var(--secondary-text)] mb-8 max-w-3xl mx-auto leading-relaxed">
        Your comprehensive learning management system for coding education.
        Connect, learn, and grow with our interactive platform.
      </p>
    </div>
  );
};

export default HeroSection;
