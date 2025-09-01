import React from 'react';

interface Student {
  id: number;
  college_id: string;
  name: string;
  class_id: number;
}

interface StudentSidepanelProps {
  student: Student;
  activeTab: 'problems' | 'submissions';
  setActiveTab: (tab: 'problems' | 'submissions') => void;
}

const StudentSidepanel: React.FC<StudentSidepanelProps> = ({ 
  student, 
  activeTab, 
  setActiveTab
}) => {
  const menuItems = [
    {
      id: 'problems' as const,
      label: 'Problems',
      icon: '📝',
      description: 'Browse and solve coding problems'
    },
    {
      id: 'submissions' as const,
      label: 'Submissions',
      icon: '📤',
      description: 'View your solution history'
    }
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-[var(--background)] border-r border-[var(--secondary-text)] z-40 mt-10">
      <div className="p-6 pt-20">
        {/* Student Info */}

        <h2 className="text-xl font-bold text-[var(--primary-text)] mb-6">
          🎯 Student Panel
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-[var(--highlight)] text-white shadow-md'
                  : 'text-[var(--primary-text)] hover:bg-[var(--secondary-text)] hover:bg-opacity-20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeTab === item.id 
                      ? 'text-white text-opacity-80' 
                      : 'text-[var(--secondary-text)]'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default StudentSidepanel;
