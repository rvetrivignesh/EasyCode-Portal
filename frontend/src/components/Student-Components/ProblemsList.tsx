import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface Problem {
  id: number;
  question_text: string;
  sample_input: string;
  sample_output: string;
  subject_name: string;
}

interface ProblemsListProps {
  studentId: number;
}

const ProblemsList: React.FC<ProblemsListProps> = ({ studentId }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [solution, setSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [copyPasteEnabled, setCopyPasteEnabled] = useState(false);
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const getDefaultCode = () => {
    return ''; // Empty code editor
  };

  // Initialize empty code when problem is selected
  useEffect(() => {
    if (selectedProblem) {
      setSolution(getDefaultCode());
      setOutput('');
      setSubmitMessage('');
    }
  }, [selectedProblem]);

  // Handle language change
  useEffect(() => {
    if (selectedProblem && solution.trim()) {
      // Only ask for confirmation if there's code written
      const userConfirms = window.confirm('Changing language will reset your code. Continue?');
      if (userConfirms) {
        setSolution(getDefaultCode());
        setOutput('');
      }
    }
  }, [language]);

  // Clear submit error messages when user starts typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasCode = solution.trim().length > 0;
      
      // Clear any previous submit error messages when user starts typing
      if (hasCode && submitMessage.includes('❌')) {
        setSubmitMessage('');
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [solution, submitMessage]);

  useEffect(() => {
    fetchProblems();
  }, [studentId]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/problems/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
      } else {
        setError('Failed to fetch problems');
      }
    } catch (error) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!solution.trim()) return;
    
    setRunning(true);
    setOutput('Running code...');
    
    try {
      const response = await fetch('http://localhost:3001/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: solution,
          language: language,
          input: selectedProblem?.sample_input || ''
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setOutput(result.output || 'No output');
      } else {
        setOutput(`Error: ${result.error || 'Failed to execute code'}`);
      }
    } catch (error) {
      setOutput('❌ Could not connect to server');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !solution.trim()) return;

    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          question_id: selectedProblem.id,
          code: solution,
          output: output || 'Pending execution'
        }),
      });

      if (response.ok) {
        setSubmitMessage('✅ Solution submitted successfully!');
        setSolution('');
        setOutput('');
        setSelectedProblem(null);
      } else {
        const error = await response.json();
        setSubmitMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      setSubmitMessage('❌ Could not connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--secondary-text)]">📚 Loading problems...</div>
      </div>
    );
  }

  if (selectedProblem) {
    return (
      <div className="flex flex-col h-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between mb-4 p-4 bg-[var(--background)] border-b border-[var(--secondary-text)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedProblem(null)}
              className="text-[var(--highlight)] hover:text-[var(--button)] transition-colors duration-200 font-medium"
            >
              ← Back to Problems
            </button>
            <h2 className="text-xl font-bold text-[var(--primary-text)]">
              Problem #{selectedProblem.id}
            </h2>
            <span className="px-3 py-1 bg-[var(--highlight)] text-white rounded-full text-sm font-medium">
              {selectedProblem.subject_name}
            </span>
          </div>
          
          {/* Editor Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--secondary-text)]">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2 py-1 text-sm border border-[var(--secondary-text)] rounded bg-[var(--background)] text-[var(--primary-text)]"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-[var(--secondary-text)]">Copy/Paste:</label>
              <button
                onClick={() => setCopyPasteEnabled(!copyPasteEnabled)}
                className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                  copyPasteEnabled 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
              >
                {copyPasteEnabled ? '✅ Enabled' : '❌ Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Problem Description Section */}
          <div className="bg-[var(--background)] border-b border-[var(--secondary-text)] p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-3">
                  📝 Problem Statement
                </h3>
                <div className="text-sm text-[var(--primary-text)] whitespace-pre-wrap leading-relaxed">
                  {selectedProblem.question_text}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[var(--primary-text)] mb-2 flex items-center gap-2">
                    📝 Sample Input:
                  </h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    <pre>{selectedProblem.sample_input}</pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[var(--primary-text)] mb-2 flex items-center gap-2">
                    ✅ Expected Output:
                  </h4>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                    <pre>{selectedProblem.sample_output}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="h-96 border-b border-[var(--secondary-text)]">
            <Editor
              height="100%"
              language={language}
              value={solution}
              onChange={(value) => setSolution(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                contextmenu: copyPasteEnabled,
                'semanticHighlighting.enabled': true,
                bracketPairColorization: { enabled: true },
                suggest: {
                  enabled: true
                },
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false
                }
              }}
              onMount={(editor, monaco) => {
                if (!copyPasteEnabled) {
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {});
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {});
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {});
                }
              }}
            />
          </div>

          {/* Action Buttons Section - Always Visible */}
          <div className="flex-shrink-0 p-4 border-b border-[var(--secondary-text)] bg-[var(--background)] sticky bottom-0">
            {submitMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${
                submitMessage.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--secondary-text)]">
                📊 Lines: {solution.split('\n').length} | Characters: {solution.length}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRun}
                  disabled={running || !solution.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {running ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Running...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ▶️ Run Code
                    </span>
                  )}
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !solution.trim()}
                  className="px-6 py-2 bg-[var(--highlight)] text-white rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚀 Submit Solution
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Output Display */}
          <div className="p-4">
            <h4 className="font-semibold text-[var(--primary-text)] mb-3 flex items-center gap-2">
              🖥️ Output
            </h4>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {output || 'Run your code to see the output here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--primary-text)]">📝 Available Problems</h2>
        <div className="text-sm text-[var(--secondary-text)]">
          Total: {problems.length} problems
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
          ❌ {error}
        </div>
      )}

      {problems.length === 0 ? (
        <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-[var(--primary-text)] mb-2">No Problems Available</h3>
          <p className="text-[var(--secondary-text)]">Check back later for new coding challenges!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6 transition-all duration-200 hover:shadow-lg hover:scale-102 cursor-pointer"
              onClick={() => setSelectedProblem(problem)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-[var(--highlight)] text-white rounded-full text-xs font-medium">
                      {problem.subject_name}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--primary-text)] mb-2">
                    Problem #{problem.id}
                  </h3>
                  <div className="text-[var(--primary-text)] text-sm line-clamp-3">
                    {problem.question_text.split('\n')[0]}
                  </div>
                </div>
                <div className="text-2xl ml-4">🎯</div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-[var(--secondary-text)]">
                <span>Click to solve</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemsList;
