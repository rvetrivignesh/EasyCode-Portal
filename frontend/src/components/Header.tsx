import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/themeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = () => {
    const userType = localStorage.getItem('userType');
    const isAdmin = localStorage.getItem('isAuthenticated') === 'true';
    const studentData = localStorage.getItem('student');
    
    return (userType === 'admin' && isAdmin) || (userType === 'student' && studentData);
  };

  // Helper to close menu and run an action
  const handleMenuAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  const handleExit = () => {
    if (window.electronAPI && window.electronAPI.exitApp) {
      window.electronAPI.exitApp();
    } else {
      console.error("electronAPI.exitApp is not available");
    }
  };

  const handleLogout = () => {
    // Check user type and clear appropriate storage
    const userType = localStorage.getItem('userType');
    
    if (userType === 'student') {
      localStorage.removeItem('student');
      localStorage.removeItem('userType');
    } else if (userType === 'admin') {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
    } else {
      // Generic cleanup for any other stored user data
      localStorage.removeItem('user');
    }
    
    // Redirect to welcome page
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4 px-6 shadow-sm transition-colors duration-200 bg-[var(--background)] border-b border-[var(--secondary-text)]">
      <div className="flex justify-between items-center">
        {/* App Title */}
        <h1 className="text-2xl font-bold text-[var(--primary-text)]">
          EasyCode Portal
        </h1>

        {/* Hamburger Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-4xl rounded-md text-[var(--primary-text)] hover:opacity-80">
            ☰
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--background)] border border-[var(--secondary-text)] rounded-lg shadow-lg flex flex-col">
              <button
                onClick={() => handleMenuAction(toggleTheme)}
                className={`px-4 py-2 text-left hover:bg-[var(--secondary-text)] ${
                  isLoggedIn() ? 'border-b' : 'border-b'
                }`}
              >
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
              {isLoggedIn() && (
                <button
                  onClick={() => handleMenuAction(handleLogout)}
                  className="px-4 py-2 text-left hover:bg-[var(--secondary-text)] border-b"
                >
                  🚪 Logout
                </button>
              )}
              <button
                onClick={() => handleMenuAction(handleExit)}
                className="px-4 py-2 text-left hover:bg-[var(--secondary-text)]"
              >
                ❌ Exit App
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
