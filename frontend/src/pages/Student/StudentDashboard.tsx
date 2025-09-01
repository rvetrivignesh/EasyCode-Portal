import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidepanel from '../../components/Student-Components/Student-Sidepanel';
import ProblemsList from '../../components/Student-Components/ProblemsList';
import StudentSubmissions from '../../components/Student-Components/StudentSubmissions';

interface Student {
  id: number;
  college_id: string;
  name: string;
  class_id: number;
}

const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'submissions'>('problems');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if student is logged in
    const storedStudent = localStorage.getItem('student');
    const userType = localStorage.getItem('userType');
    
    if (!storedStudent || userType !== 'student') {
      navigate('/');
      return;
    }
    
    setStudent(JSON.parse(storedStudent));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('userType');
    navigate('/');
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="text-[var(--secondary-text)]">📚 Loading...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[var(--background)]">
      <div className="flex h-screen">
        <StudentSidepanel 
          student={student}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <main className="flex-1 ml-64 transition-all duration-200 flex flex-col">
          {/* Welcome Header Section */}
          <div className="p-6 border-b border-[var(--secondary-text)] flex-shrink-0 bg-[var(--background)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--highlight)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--primary-text)]">
                  Welcome, {student.name}!
                </h1>
                <p className="text-[var(--secondary-text)]">
                  College ID: {student.college_id}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'problems' && <ProblemsList studentId={student.id} />}
            {activeTab === 'submissions' && <StudentSubmissions studentId={student.id} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;