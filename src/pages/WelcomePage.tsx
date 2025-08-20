// pages/WelcomePage.tsx
import React, { useState } from "react";
import AdminLoginModal from "../components/Login-Models/AdminLoginModal";
import StudentLoginModal from "../components/Login-Models/StudentLoginModal";

import HeroSection from "../components/welcome-page/HeroSection";
import FeaturesSection from "../components/welcome-page/FeaturesSection";
import LoginButtons from "../components/welcome-page/LoginButtons";
import SiteFooter from "../components/Footer"; // Adjusted import path

const WelcomePage: React.FC = () => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Hero + Features + Login */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <HeroSection />
          <FeaturesSection />
          <LoginButtons
            onAdminClick={() => setIsAdminModalOpen(true)}
            onStudentClick={() => setIsStudentModalOpen(true)}
          />
        </div>
      </div>

      <SiteFooter />

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
      <StudentLoginModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </div>
  );
};

export default WelcomePage;
