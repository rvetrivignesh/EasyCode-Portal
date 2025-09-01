import React, { useState, useEffect } from 'react';

interface Student {
  id: number;
  class_id: string;
  hallticket_no: string;
  name: string;
}

interface StudentsListProps {
  classId: string;
  className: string;
}

const StudentsList: React.FC<StudentsListProps> = ({ classId, className }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/students?class_id=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (error) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--secondary-text)]">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--primary-text)]">Students in Class</h3>
        <div className="text-sm text-[var(--secondary-text)]">
          Total: {students.length} students
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
          ❌ {error}
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-8 text-center">
          <div className="text-4xl mb-4">👨‍🎓</div>
          <h3 className="text-lg font-medium text-[var(--primary-text)] mb-2">No Students Yet</h3>
          <p className="text-[var(--secondary-text)]">Upload an Excel file to add students to this class!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-4 transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[var(--highlight)] rounded-full flex items-center justify-center text-white font-bold">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--primary-text)] text-sm">
                    {student.name}
                  </h3>
                  <p className="text-xs text-[var(--secondary-text)]">
                    {student.hallticket_no}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--secondary-text)]">
                <span>🎫</span>
                <span>Hall Ticket: {student.hallticket_no}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsList;
