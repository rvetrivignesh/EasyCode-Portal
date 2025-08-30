import React, { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  branch: string;
  batch: string;
  year: string;
  semester: string;
  excelFile: File | null;
}

const AddClass: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    branch: "",
    batch: "",
    year: "",
    semester: "",
    excelFile: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.files) {
      setFormData((prevData) => ({
        ...prevData,
        [id]: e.target.files![0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('http://localhost:3001/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: formData.branch,
          batch: formData.batch,
          year: formData.year,
          semester: formData.semester,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("✅ Class added successfully!");
        setFormData({
          branch: "",
          batch: "",
          year: "",
          semester: "",
          excelFile: null,
        });
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      setMessage("❌ Error: Could not connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
      <div>
        <label htmlFor="branch" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
          Branch
        </label>
        <select
          id="branch"
          value={formData.branch}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
          required
        >
          <option value="">Select Branch</option>
          <option value="CSE">Computer Science Engineering</option>
          <option value="CSM">Computer Science Engineering (AI & ML)</option>
          <option value="CSD">Computer Science Engineering (DS)</option>
        </select>
      </div>
      <div>
        <label htmlFor="batch" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
          Batch
        </label>
        <input
          type="text"
          id="batch"
          value={formData.batch}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
          placeholder="Enter batch: (e.g., 2024-25)"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
            Year
          </label>
          <select
            id="year"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
            required
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
            Semester
          </label>
          <select
            id="semester"
            value={formData.semester}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-[var(--secondary-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:border-transparent bg-[var(--background)] text-[var(--primary-text)] transition-colors duration-200"
            required
          >
            <option value="">Select Semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="excelFile" className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
          Excel File
        </label>
        <input
          type="file"
          id="excelFile"
          onChange={handleChange}
          className="w-full text-sm text-[var(--secondary-text)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--button)] file:text-white hover:file:bg-opacity-90"
        />
      </div>
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-[var(--highlight)] py-3 px-6 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Adding...' : 'Add Class'}
        </button>
      </div>
    </form>
  );
};

export default AddClass;

