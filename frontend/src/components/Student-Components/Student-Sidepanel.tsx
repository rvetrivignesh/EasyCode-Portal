import React from 'react';

interface SidePanelProps {
  activeView: 'problems' | 'submissions';
  onViewChange: (view: 'problems' | 'submissions') => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ activeView, onViewChange }) => {
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
    <div className="w-64 bg-[var(--background)] border-r border-[var(--secondary-text)] h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[var(--primary-text)] mb-6">
          🎯 Student Panel
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-[var(--highlight)] text-white shadow-md'
                  : 'text-[var(--primary-text)] hover:bg-[var(--secondary-text)] hover:bg-opacity-20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeView === item.id 
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

export default SidePanel;
