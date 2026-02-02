import { useState } from "react";
import { Pencil } from "lucide-react";
import EditFlashcardModal from "./EditFlashcardModal";

export default function Flashcards({ flashcards, setFlashcards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [form, setForm] = useState({ topic: "", question: "", answer: "" });
  const [editIdx, setEditIdx] = useState(null);
  
  const addCard = (e) => {
    e.preventDefault();
    if (!form.topic || !form.question || !form.answer) return;
    setFlashcards([form, ...flashcards]);
    setForm({ topic: "", question: "", answer: "" });
    setIdx(0);
    setFlipped(false);
  };
  const next = () => { setIdx((idx+1)%flashcards.length); setFlipped(false); };
  const prev = () => { setIdx((idx-1+flashcards.length)%flashcards.length); setFlipped(false); };
  // Editing logic
  const handleSaveEdit = (edit) => {
    setFlashcards(c => c.map((x, i) => i === editIdx ? edit : x));
    setEditIdx(null);
  };
  return (
    <section className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col gap-4 sm:gap-6">
      <form className="flex flex-col sm:flex-row gap-2 sm:gap-2 items-stretch sm:items-end" onSubmit={addCard}>
        <input required className="rounded-xl bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base flex-1" placeholder="Topic" value={form.topic} onChange={e=>setForm(f=>({...f, topic: e.target.value}))} />
        <input required className="rounded-xl bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base flex-1 sm:w-60" placeholder="Question" value={form.question} onChange={e=>setForm(f=>({...f, question: e.target.value}))} />
        <input required className="rounded-xl bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base flex-1 sm:w-60" placeholder="Answer" value={form.answer} onChange={e=>setForm(f=>({...f, answer: e.target.value}))} />
        <button type="submit" className="bg-indigo-700 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl px-4 py-2 text-white font-semibold shadow text-sm sm:text-base whitespace-nowrap">Add</button>
      </form>

      {editIdx !== null && (
        <EditFlashcardModal card={flashcards[editIdx]} onSave={handleSaveEdit} onCancel={() => setEditIdx(null)} />
      )}
      {flashcards.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex w-full max-w-xl items-center justify-end gap-2 mb-1">
            <button title="Edit" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300" onClick={() => setEditIdx(idx)}><Pencil className="w-5 h-5" /></button>
          </div>
          <div className={`w-full max-w-xl flex items-start justify-center bg-indigo-600 dark:bg-indigo-800 rounded-xl shadow-lg text-base sm:text-lg md:text-xl font-semibold cursor-pointer transition-transform text-white p-4 sm:p-6 ${flipped ? 'bg-indigo-700 dark:bg-indigo-900' : ''}`}
          style={{ perspective: "1000px", minHeight: "160px" }}
          onClick={()=>setFlipped(f=>!f)}
          >
        <div className="w-full text-left select-none whitespace-pre-wrap break-words">
           {flipped ? flashcards[idx].answer : flashcards[idx].question}
        </div>
        </div>
          <div className="flex gap-3 sm:gap-4 justify-center mt-2 items-center">
            <button className="bg-indigo-700 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-white text-sm sm:text-base" onClick={prev} type="button">Prev</button>
            <span className="text-indigo-700 dark:text-indigo-300 font-mono text-sm sm:text-base">{idx + 1} / {flashcards.length}</span>
            <button className="bg-indigo-700 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg px-3 sm:px-4 py-1 sm:py-2 text-white text-sm sm:text-base" onClick={next} type="button">Next</button>
          </div>
        </div>
      )}
      {flashcards.length === 0 && <div className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base">No flashcards yet. Add one above!</div>}
    </section>
  );
}