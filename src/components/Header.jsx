import { Calendar, Sun, Moon } from "lucide-react";

export default function Header({ examDate, setExamDate, daysLeft, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 gap-3 sm:gap-4 bg-white dark:bg-gray-950 border-b border-indigo-200 dark:border-indigo-800 shadow-xl rounded-b-xl">
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
        <span role="img" aria-label="Cloud">☁️</span> 
        <span className="whitespace-nowrap">AWS SAA-C03 Tracker</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-indigo-600 dark:text-indigo-200">
        <label htmlFor="exam-date" className="font-semibold text-sm sm:text-base whitespace-nowrap">Exam Date</label>
        <input
          id="exam-date"
          type="date"
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl p-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-500"
          value={examDate}
          onChange={e => setExamDate(e.target.value)}
        />
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
        <span className="bg-indigo-600 dark:bg-indigo-700 px-2 sm:px-3 py-1 text-white rounded-lg text-sm sm:text-base whitespace-nowrap">{daysLeft} Days Left</span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
}
