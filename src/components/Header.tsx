import { useTheme } from '../contexts/themeContext';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <header className="p-4 shadow-sm transition-colors duration-200 bg-[var(--background)] border-b border-[var(--secondary-text)]" >
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[var(--primary-text)]">EasyCode Portal</h1>
                <button 
                    onClick={toggleTheme}
                    className="rounded-full py-3 px-4 font-medium transition-colors duration-200 bg-[var(--button)] hover:opacity-80" 
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
        </header>
    );
};

export default Header;
