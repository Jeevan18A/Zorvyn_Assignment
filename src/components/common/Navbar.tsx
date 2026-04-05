import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  Moon, 
  Sun,
  UserCog,
  Download,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavbarProps {
  onPageChange: (page: 'dashboard' | 'transactions' | 'insights') => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onPageChange, currentPage }) => {
  const { role, setRole, darkMode, toggleDarkMode, exportData } = useStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Apply dark mode class to document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  const handleExport = (format: 'csv' | 'json') => {
    exportData(format);
    setShowExportMenu(false);
  };

  const handleThemeToggle = () => {
    toggleDarkMode();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                FinanceFlow
              </span>
            </div>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <Download className="h-5 w-5" />
                <ChevronDown className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-scale-in">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <UserCog className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'viewer')}
                className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
              >
                <option value="admin" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Admin</option>
                <option value="viewer" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Viewer</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as any)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;