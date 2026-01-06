import { useState } from "react";
import { Search, Pencil, Plus, Trash2 } from "lucide-react";
import EditRoadmapRow from "./EditRoadmapRow";

export default function Roadmap({ topics, setTopics, domains, setDomains }) {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const filtered = topics.filter((t) =>
    (!domain || t.domain === domain) &&
    (t.topic.toLowerCase().includes(search.toLowerCase()) || t.domain.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatus = (idx, val) => {
    const updated = [...topics];
    updated[idx].status = val;
    setTopics(updated);
  };

  // Edit helpers
  const saveEdit = (newTopic) => {
    setTopics((prev) => prev.map((t, idx) => (idx === editIdx ? { ...t, ...newTopic } : t)));
    setEditIdx(null);
  };
  const cancelEdit = () => setEditIdx(null);

  // Add new topic
  const handleAddTopic = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTopic = {
      topic: formData.get('topic'),
      domain: formData.get('domain'),
      resource: formData.get('resource') || '',
      difficulty: parseInt(formData.get('difficulty')) || 1,
      status: formData.get('status') || 'Not Started',
    };
    if (newTopic.topic && newTopic.domain) {
      setTopics([...topics, newTopic]);
      e.target.reset();
      setShowAddForm(false);
    }
  };

  // Delete topic
  const handleDelete = (idx) => {
    if (window.confirm('Delete this topic?')) {
      setTopics(topics.filter((_, i) => i !== idx));
      if (editIdx === idx) setEditIdx(null);
    }
  };

  // Add new domain
  const handleAddDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      setDomains([...domains, newDomain.trim()]);
      setNewDomain("");
    }
  };

  // Delete domain
  const handleDeleteDomain = (domainToDelete) => {
    if (window.confirm(`Delete domain "${domainToDelete}"? Topics in this domain will be moved to the first domain.`)) {
      const firstDomain = domains[0];
      setTopics(topics.map(t => t.domain === domainToDelete ? { ...t, domain: firstDomain } : t));
      setDomains(domains.filter(d => d !== domainToDelete));
    }
  };

  return (
    <section className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row gap-4 mb-5 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 text-indigo-500 dark:text-indigo-400" />
          <input
            className="pl-10 pr-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-2 focus:ring-2 focus:ring-indigo-500" value={domain} onChange={e => setDomain(e.target.value)}>
          <option value="">All Domains</option>
          {domains.map((dom) => (
            <option key={dom} value={dom}>{dom}</option>
          ))}
        </select>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-700 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl px-4 py-2 flex items-center gap-2 text-white">
          <Plus className="w-5 h-5" /> Add Topic
        </button>
      </div>

      {/* Add Domain Section */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-xl flex gap-2 items-center">
        <input
          className="flex-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2"
          placeholder="Add new domain..."
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddDomain()}
        />
        <button onClick={handleAddDomain} className="bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded px-3 py-2 text-white">Add Domain</button>
      </div>

      {/* Add Topic Form */}
      {showAddForm && (
        <form onSubmit={handleAddTopic} className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required name="topic" className="rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2" placeholder="Topic name" />
            <select required name="domain" className="rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2">
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input name="resource" className="rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2" placeholder="Resource (optional)" />
            <div className="flex items-center gap-2">
              <label className="text-gray-900 dark:text-white text-sm">Difficulty:</label>
              <select name="difficulty" className="rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 flex-1" defaultValue={1}>
                {[1,2,3,4,5].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <select name="status" className="rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2" defaultValue="Not Started">
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Mastered</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded px-4 py-2 flex-1 text-white">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded px-4 py-2 text-white">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Domains List */}
      <div className="mb-4 flex flex-wrap gap-2">
        {domains.map(dom => (
          <div key={dom} className="bg-indigo-100 dark:bg-indigo-900 rounded-lg px-3 py-1 flex items-center gap-2">
            <span className="text-indigo-800 dark:text-indigo-200">{dom}</span>
            <button onClick={() => handleDeleteDomain(dom)} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-indigo-600 dark:text-indigo-400">
              <th className="p-2">Topic</th>
              <th className="p-2">Domain</th>
              <th className="p-2">Resource</th>
              <th className="p-2 text-center">Difficulty</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, idx) => {
              const originalIdx = topics.findIndex(topic => topic === t);
              return editIdx === originalIdx ? (
                <EditRoadmapRow
                  key={originalIdx}
                  topic={t}
                  domains={domains}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                />
              ) : (
                <tr key={originalIdx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-2 whitespace-nowrap text-gray-900 dark:text-white">{t.topic}</td>
                  <td className="p-2 whitespace-nowrap text-gray-900 dark:text-white">{t.domain}</td>
                  <td className="p-2 whitespace-nowrap text-gray-600 dark:text-gray-300">{t.resource || "-"}</td>
                  <td className="p-2 text-center">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`inline-block w-2 h-2 mx-0.5 rounded-full ${i<=t.difficulty ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                    ))}
                  </td>
                  <td className="p-2">
                    <select
                      value={t.status}
                      onChange={e => handleStatus(originalIdx, e.target.value)}
                      className="rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-1 border border-gray-300 dark:border-gray-600"
                    >
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Mastered</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button onClick={()=>setEditIdx(originalIdx)} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-full p-1" title="Edit">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={()=>handleDelete(originalIdx)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-full p-1" title="Delete">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-6">No topics found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
