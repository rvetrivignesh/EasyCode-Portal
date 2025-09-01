import React, { useState, useEffect } from 'react';

interface Submission {
  id: number;
  question_id: number;
  code: string;
  output: string;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  question_text: string;
  subject_name: string;
}

interface StudentSubmissionsProps {
  studentId: number;
}

const StudentSubmissions: React.FC<StudentSubmissionsProps> = ({ studentId }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [studentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/submissions/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (error) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            ✅ Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            ❌ Rejected
          </span>
        );
      default:
        return (
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            ⏳ Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--secondary-text)]">📤 Loading submissions...</div>
      </div>
    );
  }

  if (selectedSubmission) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSubmission(null)}
            className="text-[var(--highlight)] hover:text-[var(--button)] transition-colors duration-200 font-medium"
          >
            ← Back to Submissions
          </button>
          <h2 className="text-2xl font-bold text-[var(--primary-text)]">
            📄 Submission Details
          </h2>
        </div>

        <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-[var(--highlight)] text-white rounded-full text-sm font-medium">
                  {selectedSubmission.subject_name}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-2">
                Problem #{selectedSubmission.question_id}
              </h3>
              <p className="text-sm text-[var(--secondary-text)]">
                Submitted on {formatDate(selectedSubmission.submitted_at)}
              </p>
            </div>
            <div>
              {getStatusBadge(selectedSubmission.status)}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-[var(--primary-text)] mb-3">Problem Statement:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-sm text-black">
                {selectedSubmission.question_text}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-[var(--primary-text)] mb-3">Your Solution:</h4>
            <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{selectedSubmission.code}</pre>
            </div>
          </div>

          {selectedSubmission.output && (
            <div>
              <h4 className="font-semibold text-[var(--primary-text)] mb-3">Output:</h4>
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                {selectedSubmission.output}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--primary-text)]">📤 Your Submissions</h2>
        <div className="text-sm text-[var(--secondary-text)]">
          Total: {submissions.length} submissions
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
          ❌ {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-8 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-[var(--primary-text)] mb-2">No Submissions Yet</h3>
          <p className="text-[var(--secondary-text)]">Start solving problems to see your submissions here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6 transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer"
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-3 py-1 bg-[var(--highlight)] text-white rounded-full text-xs font-medium">
                      {submission.subject_name}
                    </span>
                    {getStatusBadge(submission.status)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-2">
                    Problem #{submission.question_id}
                  </h3>
                  
                  <div className="text-sm text-[var(--primary-text)] mb-2 line-clamp-2">
                    {submission.question_text.split('\n')[0]}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[var(--secondary-text)]">
                    <span>📅 {formatDate(submission.submitted_at)}</span>
                    <span>💻 {submission.code.split('\n').length} lines</span>
                  </div>
                </div>
                
                <div className="text-2xl ml-4">
                  {submission.status === 'accepted' ? '✅' : 
                   submission.status === 'rejected' ? '❌' : '⏳'}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-[var(--secondary-text)] mt-4 pt-4 border-t border-[var(--secondary-text)]">
                <span>Click to view details</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSubmissions;
