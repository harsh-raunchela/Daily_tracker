import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Search, 
  Zap, 
  Tag, 
  Save, 
  Trash2, 
  CheckCircle
} from 'lucide-react';
import { api } from '../api';

const MOOD_OPTIONS = [
  { value: 1, label: 'Exhausted', glyph: '——' },
  { value: 2, label: 'Low',       glyph: '–'  },
  { value: 3, label: 'Okay',      glyph: '~'  },
  { value: 4, label: 'Good',      glyph: '+'  },
  { value: 5, label: 'Great',     glyph: '++' },
];

export function JournalPage() {
  const [selectedDate, setSelectedDate] = useState('2026-08-26');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(8);
  const [tags, setTags] = useState('clarity, habits, growth');
  const [highlights, setHighlights] = useState('');
  const [challenges, setChallenges] = useState('');
  
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await api.getJournalEntries({ search: searchQuery });
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntryForDate = async (date) => {
    try {
      const entry = await api.getJournalByDate(date);
      if (entry) {
        setTitle(entry.title || '');
        setBody(entry.body || '');
        setMood(entry.mood || 3);
        setEnergy(entry.energy || 5);
        setTags(entry.tags ? entry.tags.join(', ') : '');
        setHighlights(entry.highlights ? entry.highlights.join('\n') : '');
        setChallenges(entry.challenges ? entry.challenges.join('\n') : '');
      }
    } catch {
      setTitle(`Reflection — ${date}`);
      setBody('');
      setMood(4);
      setEnergy(7);
      setTags('');
      setHighlights('');
      setChallenges('');
    }
  };

  useEffect(() => {
    loadEntries();
    loadEntryForDate(selectedDate);
  }, [selectedDate, searchQuery]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.saveJournalEntry({
        date: selectedDate,
        title: title || `Reflection — ${selectedDate}`,
        body,
        mood,
        energy,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        highlights: highlights.split('\n').filter(Boolean),
        challenges: challenges.split('\n').filter(Boolean)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      await loadEntries();
    } catch (err) {
      console.error('Save journal error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (date) => {
    if (!window.confirm(`Delete entry for ${date}?`)) return;
    try {
      await api.deleteJournalEntry(date);
      if (date === selectedDate) loadEntryForDate(date);
      await loadEntries();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const energyLabel = energy <= 3 ? 'Depleted' : energy <= 6 ? 'Moderate' : energy <= 8 ? 'Charged' : 'Peak';
  const moodObj = MOOD_OPTIONS.find(m => m.value === mood) || MOOD_OPTIONS[2];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#cfc8ba] uppercase font-mono tracking-wider">
          04 · Daily Reflection
        </h2>
        <p className="text-xs text-[#7a7568]">
          A private space to capture thoughts, energy, mood, and daily takeaways.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="consider-card p-6 space-y-5">

            {/* Date + Mood bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262822]">
              <div className="flex items-center gap-2 font-mono text-xs">
                <CalendarIcon className="w-3.5 h-3.5 text-[#d9a441]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
              </div>

              {/* Mood selector — Consider-style text glyphs */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span className="text-[#7a7568] mr-1">MOOD</span>
                {MOOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMood(opt.value)}
                    title={opt.label}
                    className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${
                      mood === opt.value
                        ? 'border-[#d9a441] bg-[#2e2810] text-[#d9a441] font-bold'
                        : 'border-[#2b2e2b] text-[#7a7568] hover:border-[#7a7568]'
                    }`}
                  >
                    {opt.glyph}
                  </button>
                ))}
                <span className="ml-1 text-[#cfc8ba]">{moodObj.label}</span>
              </div>
            </div>

            {/* Energy slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-[#7a7568] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#d9a441]" />
                  ENERGY LEVEL
                </span>
                <span className="text-[#d9a441] font-bold">{energy}/10 · {energyLabel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#d9a441' }}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7a7568] mb-1">Entry Title</label>
              <input
                type="text"
                placeholder="e.g. Clarity and steady progress across all fronts"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0e1113] border border-[#262822] text-sm text-[#cfc8ba] focus:outline-none focus:border-[#d9a441] font-mono"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7a7568] mb-1">
                Reflection
              </label>
              <textarea
                rows="7"
                placeholder="Write freely… What worked well? What felt challenging? What did you learn?"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2.5 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] leading-relaxed focus:outline-none focus:border-[#d9a441] resize-y font-mono"
              />
            </div>

            {/* Highlights & Challenges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7a7568] mb-1">
                  Highlights (one per line)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Finished the data engine"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] font-mono focus:outline-none focus:border-[#8fb896]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#7a7568] mb-1">
                  Challenges / Learnings
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Need to avoid afternoon distractions"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] font-mono focus:outline-none focus:border-[#e06c58]"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#7a7568] mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. focus, deep-work, health"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] font-mono focus:outline-none focus:border-[#d9a441]"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                {saveSuccess && (
                  <span className="text-xs font-semibold text-[#8fb896] flex items-center gap-1 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Entry saved.
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-story accent text-xs py-2 px-5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving…' : 'Save Reflection'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right: Past Entries */}
        <div className="space-y-4">
          <div className="consider-card p-5 space-y-4">
            <h3 className="font-bold text-xs text-[#cfc8ba] uppercase font-mono tracking-wider">
              Past Reflections
            </h3>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4d46]" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-[#0e1113] border border-[#262822] text-xs text-[#cfc8ba] font-mono focus:outline-none focus:border-[#d9a441]"
              />
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {entries && entries.length > 0 ? (
                entries.map((entry) => {
                  const isCurrent = entry.date === selectedDate;
                  const moodGlyph = MOOD_OPTIONS.find(m => m.value === entry.mood)?.glyph || '~';
                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedDate(entry.date)}
                      className={`p-3 rounded border transition-all cursor-pointer select-none font-mono ${
                        isCurrent
                          ? 'bg-[#1e1e15] border-[#d9a441]'
                          : 'bg-[#121518] border-[#262822] hover:border-[#4a4d46]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#cfc8ba]">{entry.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#d9a441] font-bold">{moodGlyph}</span>
                          <span className="text-[10px] text-[#7a7568]">⚡{entry.energy}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.date); }}
                            className="text-[#4a4d46] hover:text-[#e06c58] p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#cfc8ba] truncate">{entry.title}</p>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {entry.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1b1f23] text-[#7a7568]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-[#7a7568] font-mono">
                  No previous entries found.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
