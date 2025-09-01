import { useState } from 'react';
import { useTheme } from '../contexts/themeContext';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
    // Example logout logic (clear session/token)
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login page
  };

  return (
    <header className="p-4 px-6 shadow-sm transition-colors duration-200 bg-[var(--background)] border-b border-[var(--secondary-text)]">
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
                className="px-4 py-2 text-left hover:bg-[var(--secondary-text)] border-b"
              >
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
              <button
                onClick={() => handleMenuAction(handleLogout)}
                className="px-4 py-2 text-left hover:bg-[var(--secondary-text)] border-b"
              >
                🚪 Logout
              </button>
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
