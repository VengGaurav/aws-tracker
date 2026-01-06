import { useState } from "react";
import { Download, Upload, RefreshCw, FileText } from "lucide-react";
import jsPDF from "jspdf";

export default function Settings({ state, setState, reset }) {
  const [imported, setImported] = useState("");
  const [err, setErr] = useState("");

  const handleImport = () => {
    try {
      const data = JSON.parse(imported);
      setState(data);
      setErr("");
      alert("Data imported successfully!");
      setImported("");
    } catch {
      setErr("Invalid JSON format");
    }
  };

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    alert("State copied to clipboard!");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Indigo color
    doc.setFont(undefined, "bold");
    doc.text("AWS SAA-C03 Study Tracker", margin, yPos);
    yPos += 15;

    // Exam Date
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("Exam Date:", margin, yPos);
    doc.setFont(undefined, "normal");
    doc.text(state.examDate || "Not set", margin + 40, yPos);
    yPos += 10;

    // Calculate days left
    if (state.examDate) {
      const daysLeft = Math.max(0, Math.ceil((new Date(state.examDate) - new Date()) / (1000 * 60 * 60 * 24)));
      doc.setFont(undefined, "bold");
      doc.text("Days Left:", margin, yPos);
      doc.setFont(undefined, "normal");
      doc.text(`${daysLeft} days`, margin + 40, yPos);
      yPos += 15;
    }

    // Domains Section
    if (state.domains && state.domains.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Domains", margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");
      state.domains.forEach((domain, idx) => {
        checkPageBreak(8);
        doc.text(`${idx + 1}. ${domain}`, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    }

    // Roadmap Section
    if (state.roadmap && state.roadmap.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Study Roadmap", margin, yPos);
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");

      // Table headers
      checkPageBreak(10);
      doc.setFont(undefined, "bold");
      doc.text("Topic", margin, yPos);
      doc.text("Domain", margin + 60, yPos);
      doc.text("Status", margin + 100, yPos);
      doc.text("Difficulty", margin + 140, yPos);
      yPos += 6;
      doc.setFont(undefined, "normal");

      state.roadmap.forEach((topic) => {
        checkPageBreak(10);
        const topicText = (topic.topic || "-").substring(0, 25);
        const domainText = (topic.domain || "-").substring(0, 15);
        const statusText = (topic.status || "-").substring(0, 12);
        doc.text(topicText, margin, yPos);
        doc.text(domainText, margin + 60, yPos);
        doc.text(statusText, margin + 100, yPos);
        doc.text(`${topic.difficulty || 0}/5`, margin + 140, yPos);
        yPos += lineHeight;
      });
      yPos += 5;
    }

    // Flashcards/Difficult Questions Section
    if (state.flashcards && state.flashcards.length > 0) {
      checkPageBreak(25);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Difficult Questions / Flashcards", margin, yPos);
      yPos += 8;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");

      state.flashcards.forEach((card, idx) => {
        checkPageBreak(30);
        doc.setFont(undefined, "bold");
        const topicText = `Q${idx + 1}: ${card.topic || "Untitled"}`;
        doc.text(topicText.substring(0, 80), margin, yPos);
        yPos += 6;
        doc.setFont(undefined, "normal");
        const questionText = `Question: ${card.question || "-"}`;
        const questionLines = doc.splitTextToSize(questionText, 170);
        doc.text(questionLines, margin + 5, yPos);
        yPos += questionLines.length * 5;
        const answerText = `Answer: ${card.answer || "-"}`;
        const answerLines = doc.splitTextToSize(answerText, 170);
        doc.text(answerLines, margin + 5, yPos);
        yPos += answerLines.length * 5 + 3;
      });
    }

    // Summary Statistics
    if (state.roadmap && state.roadmap.length > 0) {
      checkPageBreak(25);
      const mastered = state.roadmap.filter(r => r.status === 'Mastered').length;
      const inProgress = state.roadmap.filter(r => r.status === 'In Progress').length;
      const notStarted = state.roadmap.filter(r => r.status === 'Not Started').length;
      const total = state.roadmap.length;
      const percent = total ? Math.round((mastered / total) * 100) : 0;

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(99, 102, 241);
      doc.text("Progress Summary", margin, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal");
      doc.text(`Total Topics: ${total}`, margin, yPos);
      yPos += 6;
      doc.text(`Mastered: ${mastered} (${percent}%)`, margin, yPos);
      yPos += 6;
      doc.text(`In Progress: ${inProgress}`, margin, yPos);
      yPos += 6;
      doc.text(`Not Started: ${notStarted}`, margin, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);

    // Save PDF
    doc.save(`AWS-SAA-C03-Study-Tracker-${new Date().toISOString().split('T')[0]}.pdf`);
    alert("PDF exported successfully!");
  };

  return (
    <section className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
        <Download className="w-6 h-6" /> Data Backup & Recovery
      </h2>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700">
        <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export My Progress
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Export your study data in different formats. JSON for backup/restore, PDF for printing or sharing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleExport} className="flex-1 bg-indigo-700 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl px-4 py-2 text-white font-semibold shadow flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Copy JSON to Clipboard
          </button>
          <button onClick={handleExportPDF} className="flex-1 bg-red-700 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl px-4 py-2 text-white font-semibold shadow flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Export as PDF
          </button>
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
        <h3 className="font-bold text-gray-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import Data
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Paste your saved JSON code here to restore your progress.
        </p>
        <textarea
          className="w-full h-32 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-3 font-mono text-sm border border-gray-300 dark:border-gray-600"
          placeholder="Paste JSON state to import..."
          value={imported}
          onChange={e => setImported(e.target.value)}
        />
        <button onClick={handleImport} className="w-full bg-blue-700 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl px-4 py-2 mt-2 text-white shadow">
          Import Data
        </button>
        {err && <div className="mt-2 text-red-600 dark:text-red-400 font-mono text-sm">{err}</div>}
      </div>

      <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
        <button onClick={reset} className="w-full bg-red-700 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl px-4 py-2 text-white shadow flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Reset Everything (Delete All Data)
        </button>
      </div>
    </section>
  );
}
