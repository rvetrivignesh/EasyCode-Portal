import React, { useState } from "react";
import AddClass from "../components/AddClass";
import ClassesPage from "./ClassesPage";
import SidePanel from "../components/SidePanel";

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'classes' | 'addClass'>('classes');

  const renderContent = () => {
    switch (activeView) {
      case 'classes':
        return <ClassesPage />;
      case 'addClass':
        return (
          <div className="max-w-2xl">
            <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6">
              <h2 className="text-xl font-semibold mb-6 text-[var(--primary-text)] flex items-center gap-2">
                <span>➕</span> Add New Class
              </h2>
              <AddClass />
            </div>
          </div>
        );
      default:
        return <ClassesPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <SidePanel activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

