import React, { useState, useEffect } from 'react';
import { BarChart2, BookOpen, RotateCcw, AlertTriangle, Save, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [domains, setDomains] = useState(initialDomains);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [flashcards, setFlashcards] = useState([]);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load user data from Firestore
        await loadUserData(currentUser.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExamDate(data.examDate || defaultExamDate);
        setDomains(data.domains || initialDomains);
        setRoadmap(data.roadmap || initialRoadmap);
        setFlashcards(data.flashcards || []);
        setTheme(data.theme || 'dark');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Save user data to Firestore
  const saveUserData = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        examDate,
        domains,
        roadmap,
        flashcards,
        theme,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        saveUserData();
      }, 1000); // Save after 1 second of inactivity
      
      return () => clearTimeout(timeoutId);
    }
  }, [examDate, domains, roadmap, flashcards, theme, user]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut(auth);
      setUser(null);
    }
  };

  // Days left calculation
  const daysLeft = Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)));

  // Dashboard data calculations
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

  // Settings state
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
    }
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  // Main app
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
      <Header examDate={examDate} setExamDate={setExamDate} daysLeft={daysLeft} theme={theme} setTheme={setTheme} />
      
      {/* User Info & Logout */}
      {/* User Info & Logout - Updated */}
<div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 dark:from-indigo-900/30 dark:to-purple-900/30 border-b border-indigo-200 dark:border-indigo-800">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
        <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
          {user.displayName || user.email.split('@')[0]}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
          {user.email}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <div className="hidden sm:block text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          {user.emailVerified ? '✓ Verified' : 'Not verified'}
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</div>
      
      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 mt-3 sm:mt-4 flex-wrap px-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl font-semibold transition shadow text-xs sm:text-sm md:text-base whitespace-nowrap ${
              activeTab === tab.id 
                ? "bg-indigo-700 dark:bg-indigo-600 text-white" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-8">
        {activeTab === 'dashboard' && <Dashboard progress={progress} domainStats={domainStats} badges={badges} roadmap={roadmap} flashcards={flashcards} domains={domains} />}
        {activeTab === 'roadmap' && <Roadmap topics={roadmap} setTopics={setRoadmap} domains={domains} setDomains={setDomains} />}
        {activeTab === 'flashcards' && <Flashcards flashcards={flashcards} setFlashcards={setFlashcards} />}
        {activeTab === 'difficult' && <LogIssues flashcards={flashcards} setFlashcards={setFlashcards} />}
        {activeTab === 'settings' && <Settings state={settingsState} setState={setSettingsState} reset={reset} />}
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 Gaurav Vengurlekar | All rights reserved
          </p>
        </footer>
      </main>
    </div>
  );
}