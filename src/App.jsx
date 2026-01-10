import React, { useState, useEffect } from 'react';
import { BarChart2, BookOpen, RotateCcw, AlertTriangle, Save } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Roadmap from './components/Roadmap';
import Flashcards from './components/Flashcards';
import LogIssues from './components/LogIssues';
import Settings from './components/Settings';
import Header from './components/Header';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'roadmap', label: 'Roadmap', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: RotateCcw },
  { id: 'difficult', label: 'Log Issues', icon: AlertTriangle },
  { id: 'settings', label: 'Settings / Backup', icon: Save },
];

const initialDomains = ["Security", "Compute", "Databases", "Networking", "Storage"];
const initialRoadmap = [
  { topic: 'IAM Users', domain: 'Security', resource: 'Video: IAM', difficulty: 2, status: 'Not Started' },
  { topic: 'EC2 Launch', domain: 'Compute', resource: 'Lab: EC2', difficulty: 4, status: 'In Progress' },
  { topic: 'S3 Buckets', domain: 'Storage', resource: 'Guide: S3', difficulty: 1, status: 'Mastered' },
];
const defaultExamDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  
  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // LocalStorage state management
  const [examDate, setExamDate] = useState(() => localStorage.getItem('examDate') || defaultExamDate);
  const [domains, setDomains] = useState(() => {
    const saved = localStorage.getItem('domains');
    return saved ? JSON.parse(saved) : initialDomains;
  });
  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem('roadmap');
    return saved ? JSON.parse(saved) : initialRoadmap;
  });
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('flashcards');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('examDate', examDate); }, [examDate]);
  useEffect(() => { localStorage.setItem('domains', JSON.stringify(domains)); }, [domains]);
  useEffect(() => { localStorage.setItem('roadmap', JSON.stringify(roadmap)); }, [roadmap]);
  useEffect(() => { localStorage.setItem('flashcards', JSON.stringify(flashcards)); }, [flashcards]);

  // Days left calculation
  const daysLeft = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

  // Dashboard data calculations - Uses actual domains state (automatically updates when domains change)
  // This recalculates every time roadmap or domains change
  const domainStats = domains.map(domain => {
    const domainTopics = roadmap.filter(r => r.domain === domain);
    const total = domainTopics.length;
    const mastered = domainTopics.filter(r => r.status === 'Mastered').length;
    const percent = total ? Math.round((mastered / total) * 100) : 0;
    return { domain, percent, total, mastered };
  });
  
  const progress = [
    { name: 'Mastered', value: roadmap.filter(r => r.status === 'Mastered').length },
    { name: 'In Progress', value: roadmap.filter(r => r.status === 'In Progress').length },
    { name: 'Not Started', value: roadmap.filter(r => r.status === 'Not Started').length },
  ];
  
  const totalTopics = roadmap.length;
  const mastered = progress[0].value;
  const percent = totalTopics ? (mastered / totalTopics) * 100 : 0;

  const badges = [
    { 
      name: 'Cloud Rookie', 
      unlocked: mastered >= 5,
      description: 'Complete your first 5 topics'
    },
    { 
      name: 'Halfway There', 
      unlocked: percent >= 50,
      description: 'Reach 50% course completion'
    },
    { 
      name: 'Exam Ready', 
      unlocked: percent >= 100,
      description: 'Master all topics'
    },
  ];

  // Settings/global state for backup/import/reset
  const settingsState = { examDate, domains, roadmap, flashcards };
  const setSettingsState = (newState) => {
    setExamDate(newState.examDate || defaultExamDate);
    setDomains(Array.isArray(newState.domains) ? newState.domains : initialDomains);
    setRoadmap(Array.isArray(newState.roadmap) ? newState.roadmap : initialRoadmap);
    setFlashcards(Array.isArray(newState.flashcards) ? newState.flashcards : []);
  };
  const reset = () => {
    if (window.confirm("Are you sure? This will delete all progress.")) {
      setExamDate(defaultExamDate);
      setDomains(initialDomains);
      setRoadmap(initialRoadmap);
      setFlashcards([]);
      localStorage.clear();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
      <Header examDate={examDate} setExamDate={setExamDate} daysLeft={daysLeft} theme={theme} setTheme={setTheme} />
      <nav className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 mt-3 sm:mt-4 flex-wrap px-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl font-semibold transition shadow text-xs sm:text-sm md:text-base whitespace-nowrap ${activeTab === tab.id ? "bg-indigo-700 dark:bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-8 sm:pb-16">
        {activeTab === 'dashboard' && <Dashboard progress={progress} domainStats={domainStats} badges={badges} roadmap={roadmap} flashcards={flashcards} domains={domains} />}
        {activeTab === 'roadmap' && <Roadmap topics={roadmap} setTopics={setRoadmap} domains={domains} setDomains={setDomains} />}
        {activeTab === 'flashcards' && <Flashcards flashcards={flashcards} setFlashcards={setFlashcards} />}
        {activeTab === 'difficult' && <LogIssues flashcards={flashcards} setFlashcards={setFlashcards} />}
        {activeTab === 'settings' && <Settings state={settingsState} setState={setSettingsState} reset={reset} />}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Gaurav Vengurlekar | All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}