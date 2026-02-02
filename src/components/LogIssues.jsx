import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import EditFlashcardModal from "./EditFlashcardModal";
import { useAlert } from "../context/AlertContext";

export default function LogIssues({ flashcards, setFlashcards }) {
  const { showConfirm } = useAlert();
  const [form, setForm] = useState({ topic: "", question: "", answer: "" });
  const [editIdx, setEditIdx] = useState(null);

  const addQuestion = (e) => {
    e.preventDefault();
    if (!form.topic || !form.question || !form.answer) return;
    setFlashcards([...flashcards, { ...form, id: Date.now() }]);
    setForm({ topic: "", question: "", answer: "" });
  };

  const deleteQuestion = async (id) => {
    const confirmed = await showConfirm('Delete this question?', {
      title: 'Delete Question',
      confirmLabel: 'Yes, delete',
      type: 'error',
    });
    if (confirmed) {
      setFlashcards(flashcards.filter(q => q.id !== id));
      if (editIdx !== null && flashcards[editIdx]?.id === id) setEditIdx(null);
    }
  };

  const handleSaveEdit = (edit) => {
    setFlashcards(c => c.map((x, i) => i === editIdx ? { ...x, ...edit } : x));
    setEditIdx(null);
  };

  return (
    <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Add Form */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 rounded-xl col-span-1 h-fit">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Log Difficult Question
          </h3>
          <form onSubmit={addQuestion} className="space-y-3 sm:space-y-4">
            <input
              required
              className="w-full rounded-xl bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              placeholder="Topic (e.g., S3)..."
              value={form.topic}
              onChange={e => setForm({...form, topic: e.target.value})}
            />
            <textarea
              required
              className="w-full rounded-xl bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 h-20 sm:h-24 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base resize-y"
              placeholder="The Tricky Question..."
              value={form.question}
              onChange={e => setForm({...form, question: e.target.value})}
            />
            <textarea
              required
              rows="6"
              className="w-full rounded-xl bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base resize-y"
              placeholder="Correct Answer... (Use Enter for new lines)"
              value={form.answer}
              onChange={e => setForm({...form, answer: e.target.value})}
            />
            <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl px-4 py-2 text-white font-semibold shadow text-sm sm:text-base">
              Add to Log
            </button>
          </form>
        </div>

        {/* Questions List */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 rounded-xl col-span-1 lg:col-span-2 min-h-[300px] sm:min-h-[400px]">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-indigo-700 dark:text-indigo-300">My Difficult Questions Log</h3>
          {editIdx !== null && (
            <EditFlashcardModal
              card={flashcards[editIdx]}
              onSave={handleSaveEdit}
              onCancel={() => setEditIdx(null)}
            />
          )}
          {flashcards.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12 sm:py-20 text-sm sm:text-base">
              <p>No difficult questions logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {flashcards.map((q, idx) => (
                <div key={q.id || idx} className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow relative bg-orange-50 dark:bg-orange-900/10">
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2">
                    <button onClick={() => setEditIdx(idx)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteQuestion(q.id)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-0.5 rounded-md mb-2 font-medium">{q.topic}</div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base pr-12">{q.question}</h4>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-green-600 dark:text-green-400 block mb-1">Answer:</span>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {q.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}