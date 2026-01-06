import { useState } from "react";

export default function EditFlashcardModal({ card, onSave, onCancel }) {
  const [edit, setEdit] = useState(card);
  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-6 sm:p-8 rounded-xl shadow-lg min-w-[280px] sm:min-w-[320px] max-w-full flex flex-col gap-4">
        <h2 className="font-bold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">Edit Flashcard</h2>
        <input className="rounded bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600" value={edit.topic} onChange={e=>setEdit({...edit, topic: e.target.value})} placeholder="Topic" />
        <textarea className="rounded bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600 min-h-[60px]" value={edit.question} onChange={e=>setEdit({...edit, question: e.target.value})} placeholder="Question" />
        <textarea className="rounded bg-gray-100 dark:bg-gray-900 p-2 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600 min-h-[60px]" value={edit.answer} onChange={e=>setEdit({...edit, answer: e.target.value})} placeholder="Answer" />
        <div className="flex gap-3 mt-2">
          <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl px-4 py-2 text-sm sm:text-base flex-1" onClick={()=>onSave(edit)}>Save</button>
          <button className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm sm:text-base flex-1" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
