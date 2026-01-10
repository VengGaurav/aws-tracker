import { Calendar, Sun, Moon } from "lucide-react";

export default function Header({ examDate, setExamDate, daysLeft, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 dark:from-indigo-900 dark:via-indigo-950 dark:to-gray-950 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Top Row - Title */}
        <div className="flex items-center justify-between mb-4 sm:mb-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">☁️</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap">
              AWS SAA-C03 Tracker
            </h1>
          </div>
          
          {/* Theme Toggle - Desktop */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex p-2 sm:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-200" />
            )}
          </button>
        </div>

        {/* Bottom Row - Exam Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
            <label htmlFor="exam-date" className="font-semibold text-xs sm:text-sm whitespace-nowrap">
              Exam Date:
            </label>
            <input
              id="exam-date"
              type="date"
              className="bg-white text-gray-900 rounded-lg px-2 py-1 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 sm:px-4 py-2 rounded-xl text-white font-bold text-sm sm:text-base shadow-lg flex items-center gap-2 animate-pulse">
              <span className="text-lg sm:text-xl">⏱️</span>
              <span className="whitespace-nowrap">{daysLeft} Days Left</span>
            </div>
            
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="sm:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-200" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
            style={{ width: '0%' }}
          ></div>
        </div>
      </div>
    </header>
  );
}