import { useState } from "react";

export default function EditRoadmapRow({ topic, domains, onSave, onCancel }) {
  const [edit, setEdit] = useState({...topic});
  return (
    <tr className="bg-yellow-50 dark:bg-yellow-900/20">
      <td className="p-2">
        <input className="rounded bg-white dark:bg-gray-800 p-1 w-full text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600" value={edit.topic} onChange={e=>setEdit({...edit, topic: e.target.value})} />
      </td>
      <td className="p-2 hidden sm:table-cell">
        <select className="rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600 w-full" value={edit.domain} onChange={e=>setEdit({...edit, domain: e.target.value})}>
          {domains.map(dom => <option key={dom} value={dom}>{dom}</option>)}
        </select>
      </td>
      <td className="p-2 hidden md:table-cell">
        <input className="rounded bg-white dark:bg-gray-800 p-1 w-full text-gray-900 dark:text-white text-sm sm:text-base border border-gray-300 dark:border-gray-600" value={edit.resource || ''} onChange={e=>setEdit({...edit, resource: e.target.value})} />
      </td>
      <td className="p-2 text-center">
        {[1,2,3,4,5].map(i => (
          <button
            type="button"
            key={i}
            className={`inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1 ${i<=edit.difficulty ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-gray-600'}`}
            onClick={()=>setEdit({...edit, difficulty: i})}
          ></button>
        ))}
      </td>
      <td className="p-2">
        <select className="rounded p-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm border border-gray-300 dark:border-gray-600 w-full sm:w-auto" value={edit.status} onChange={e=>setEdit({...edit, status: e.target.value})}>
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Mastered</option>
        </select>
      </td>
      <td className="p-2">
        <div className="flex gap-1 sm:gap-2">
          <button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded px-2 sm:px-3 py-1 text-xs sm:text-sm" onClick={()=>onSave(edit)}>Save</button>
          <button className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm text-gray-900 dark:text-white" onClick={onCancel}>Cancel</button>
        </div>
      </td>
    </tr>
  );
}
