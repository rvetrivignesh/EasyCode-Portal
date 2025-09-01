import React, { useState } from 'react';

interface ExcelUploadProps {
  classId: string;
  onUploadSuccess: () => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ classId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    console.log('📊 Starting upload:', { fileName: file.name, fileSize: file.size, classId });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('class_id', classId);

      console.log('📤 Sending request to upload students...');
      const response = await fetch('http://localhost:3001/api/upload-students', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('📥 Upload response:', { status: response.status, result });

      if (response.ok) {
        const skipMessage = result.skipped_count > 0 ? ` (${result.skipped_count} duplicates skipped)` : '';
        setMessage(`✅ Successfully uploaded ${result.students_count} students!${skipMessage}`);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Call the success callback to refresh the students list
        console.log('🔄 Calling onUploadSuccess callback...');
        onUploadSuccess();
      } else {
        console.error('❌ Upload failed:', result);
        setError(result.detail || result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Could not connect to server');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[var(--background)] rounded-xl shadow-[0_8px_32px_0_rgba(44,62,80,0.25)] border border-[var(--secondary-text)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-semibold text-[var(--primary-text)]">Upload Students</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="excel-file"
            className="block text-sm font-medium text-[var(--secondary-text)] mb-2"
          >
            Excel File
          </label>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            📋 <strong>Simple Format:</strong><br/>
            • No headers needed - just 2 columns of data<br/>
            • Column 1: College ID (e.g., 25F45A3301, 25F45A3302, etc.)<br/>
            • Column 2: Student Name<br/>
            • Duplicates will be automatically skipped<br/>
            • Works with .xlsx and .xls files
          </div>
          <input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[var(--highlight)] file:text-white hover:file:bg-[var(--button)] transition-colors duration-200"
          />
        </div>

        {file && (
          <div className="text-sm text-[var(--secondary-text)]">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        {error && (
          <div className="p-3 rounded-md text-sm bg-red-100 text-red-800">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="p-3 rounded-md text-sm bg-green-100 text-green-800">
            {message}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-[var(--highlight)] text-white py-2 px-4 rounded-md hover:bg-[var(--button)] focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </span>
          ) : (
            'Upload Students'
          )}
        </button>
      </div>
    </div>
  );
};

export default ExcelUpload;
