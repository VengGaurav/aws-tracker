import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Legend, LabelList } from "recharts";
import { Award, BookOpen, CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";

const COLORS = ["#10B981", "#F59E0B", "#E5E7EB"];

export default function Dashboard({ progress, domainStats, badges, roadmap, flashcards, domains }) {
  const totalTopics = roadmap?.length || 0;
  const mastered = progress.find(p => p.name === 'Mastered')?.value || 0;
  const inProgress = progress.find(p => p.name === 'In Progress')?.value || 0;
  const notStarted = progress.find(p => p.name === 'Not Started')?.value || 0;
  const overallPercent = totalTopics ? Math.round((mastered / totalTopics) * 100) : 0;
  const totalFlashcards = flashcards?.length || 0;

  // Calculate domain stats with more details - Show ALL domains, even with 0 topics
  const enhancedDomainStats = (domains || []).map(domain => {
    const domainTopics = roadmap?.filter(r => r.domain === domain) || [];
    const domainMastered = domainTopics.filter(t => t.status === 'Mastered').length;
    const domainInProgress = domainTopics.filter(t => t.status === 'In Progress').length;
    const domainNotStarted = domainTopics.filter(t => t.status === 'Not Started').length;
    const total = domainTopics.length;
    const percent = total ? Math.round((domainMastered / total) * 100) : 0;
    return {
      domain,
      percent,
      total,
      mastered: domainMastered,
      inProgress: domainInProgress,
      notStarted: domainNotStarted
    };
  }); // Removed filter - show all domains

  // Custom tooltip for pie chart - clean and simple
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = totalTopics ? ((data.value / totalTopics) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.value}</span> topics
            <span className="text-gray-500 dark:text-gray-500"> • {percent}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{data.domain}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{data.percent}%</span> Mastery
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold">{data.total}</span> topics
            </p>
            <p className="text-green-600 dark:text-green-400">
              Mastered: <span className="font-semibold">{data.mastered}</span>
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">
              In Progress: <span className="font-semibold">{data.inProgress}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Not Started: <span className="font-semibold">{data.notStarted}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="w-full space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{totalTopics}</span>
          </div>
          <p className="text-sm sm:text-base opacity-90">Total Topics</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{mastered}</span>
          </div>
          <p className="text-sm sm:text-base opacity-90">Mastered</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{inProgress}</span>
          </div>
          <p className="text-sm sm:text-base opacity-90">In Progress</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 sm:p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-2xl sm:text-3xl font-bold">{totalFlashcards}</span>
          </div>
          <p className="text-sm sm:text-base opacity-90">Flashcards</p>
        </div>
      </div>

      {/* Overall Progress Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Overall Progress
          </h2>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">{overallPercent}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{mastered} of {totalTopics} topics</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 sm:h-6 mb-6">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 h-4 sm:h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
            style={{ width: `${overallPercent}%` }}
          >
            {overallPercent > 10 && <span className="text-xs font-bold text-white">{overallPercent}%</span>}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clean Pie Chart - Simplified */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Progress Distribution</h2>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={progress}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={150}
                fill="#8884d8"
                paddingAngle={4}
                animationBegin={0}
                animationDuration={600}
              >
                {progress.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={COLORS[idx % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingTop: '30px' }}
                formatter={(value) => {
                  const data = progress.find(p => p.name === value);
                  const count = data?.value || 0;
                  return (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {value} <span className="text-gray-500 dark:text-gray-500">({count})</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Enhanced Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Domain Mastery</h2>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart 
              data={enhancedDomainStats} 
              layout="vertical" 
              margin={{ top: 10, right: 50, left: 20, bottom: 10 }}
            >
              <XAxis 
                type="number" 
                stroke="#9ca3af" 
                fontSize={13}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                dataKey="domain" 
                type="category" 
                stroke="#9ca3af" 
                fontSize={13}
                width={120}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="percent" 
                fill="#6366f1" 
                radius={[0, 8, 8, 0]}
                animationBegin={0}
                animationDuration={600}
              >
                {enhancedDomainStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.percent === 100 ? '#10B981' : 
                      entry.percent >= 75 ? '#6366f1' : 
                      entry.percent >= 50 ? '#8b5cf6' : 
                      entry.percent >= 25 ? '#F59E0B' : 
                      '#E5E7EB'
                    }
                  />
                ))}
                <LabelList 
                  dataKey="percent" 
                  position="right" 
                  formatter={(value) => `${value}%`}
                  style={{ fill: '#4b5563', fontSize: '13px', fontWeight: '600' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Domain Details Grid - Show ALL domains */}
      {enhancedDomainStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Domain Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enhancedDomainStats.map((domain) => (
              <div key={domain.domain} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{domain.domain}</h3>
                  <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">{domain.percent}%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{domain.total}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-600 dark:text-green-400">Mastered:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{domain.mastered}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-yellow-600 dark:text-yellow-400">In Progress:</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">{domain.inProgress}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-500 dark:text-gray-500">Not Started:</span>
                    <span className="font-semibold text-gray-500 dark:text-gray-500">{domain.notStarted}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        domain.percent === 100 ? 'bg-green-500' : 
                        domain.percent >= 50 ? 'bg-indigo-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${domain.percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 dark:text-yellow-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div 
              key={badge.name} 
              className={`p-4 rounded-xl border-2 transition-all ${
                badge.unlocked 
                  ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 border-indigo-300 dark:border-indigo-700 shadow-md' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${badge.unlocked ? 'bg-indigo-500 dark:bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <Award className={`w-5 h-5 sm:w-6 sm:h-6 ${badge.unlocked ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm sm:text-base ${badge.unlocked ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs sm:text-sm mt-1 ${badge.unlocked ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {badge.unlocked ? '✓ Unlocked' : 'Locked'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
