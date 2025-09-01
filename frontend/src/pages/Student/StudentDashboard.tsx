import React, { useState } from 'react';
import SidePanel from '../../components/Student-Components/Student-Sidepanel';
// import ProblemsList from '../../components/Student-Components/ProblemsList';
// import SubmissionsList from '../../components/Student-Components/SubmissionsList';
// Import other student components as needed

const StudentDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'problems' | 'submissions'>('problems');

  return (
    <div className="flex h-screen">
      <SidePanel activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 p-8 bg-[var(--background)] overflow-auto">
        {/* {activeView === 'problems' && <ProblemsList />}
        {activeView === 'submissions' && <SubmissionsList />} */}
        {/* Add other student components here if needed */}
      </main>
    </div>
  );
};

export default StudentDashboard;