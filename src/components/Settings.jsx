import { Download, Upload, RotateCcw } from "lucide-react";

export default function Settings({ state, setState, reset }) {
  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aws-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          setState(data);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Error importing data. Please check the file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Settings & Backup</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Backup Your Data</h3>
          <button
            onClick={exportData}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-semibold"
          >
            <Download className="w-5 h-5" />
            Export Data (Download JSON)
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Download your data as a JSON file. Share this file with others!
          </p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Import Data</h3>
          <label className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-semibold cursor-pointer">
            <Upload className="w-5 h-5" />
            Import Data (Upload JSON)
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Upload a backup file to restore your data
          </p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <h3 className="font-semibold mb-3 text-red-600 dark:text-red-400">Reset All Data</h3>
          <button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Everything
          </button>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            ⚠️ This will delete all your progress permanently!
          </p>
        </div>
      </div>
    </section>
  );
}