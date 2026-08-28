import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Trash2, 
  Award,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredScore, setRequiredScore] = useState(85);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await api.getRewards('2026-08');
      setRewards(data.rewards || []);
      setCurrentScore(data.currentScore || 0);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRewards(); }, []);

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createReward({
        title,
        description,
        requiredScore: Number(requiredScore),
        month: '2026-08'
      });
      setTitle('');
      setDescription('');
      setRequiredScore(85);
      setIsModalOpen(false);
      await loadRewards();
    } catch (err) {
      console.error('Create reward error:', err);
    }
  };

  const handleClaimReward = async (rewardId) => {
    try {
      await api.claimReward(rewardId);
      await loadRewards();
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const handleDeleteReward = async (rewardId) => {
    try {
      await api.deleteReward(rewardId);
      await loadRewards();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#cfc8ba] uppercase font-mono tracking-wider">
            06 · Rewards &amp; Milestones
          </h2>
          <p className="text-xs text-[#7a7568]">
            Define personal milestones to celebrate consistent effort and meaningful growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Score badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#2b2e2b] bg-[#121518] font-mono text-xs">
            <Award className="w-3.5 h-3.5 text-[#d9a441]" />
            <span className="text-[#7a7568]">Score:</span>
            <span className="text-[#d9a441] font-bold">{currentScore}/100</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-story accent text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Reward</span>
          </button>
        </div>
      </div>

      {/* Score progress bar */}
      <div className="consider-card p-4 font-mono">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#7a7568] uppercase tracking-wider">August Score Progress</span>
          <span className="text-[#d9a441] font-bold">{currentScore} / 100</span>
        </div>
        <div className="h-1.5 bg-[#1b1f23] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${currentScore}%`, backgroundColor: '#d9a441' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] text-[#4a4d46]">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rewards && rewards.length > 0 ? (
          rewards.map((reward) => {
            const isUnlocked = reward.unlocked;
            const isClaimed = reward.claimed;
            const progress = Math.min(100, (currentScore / reward.requiredScore) * 100);

            return (
              <div
                key={reward.id}
                className={`consider-card p-5 flex flex-col justify-between transition-all ${
                  isClaimed
                    ? 'opacity-60'
                    : isUnlocked
                    ? 'border-[#8fb896] shadow-[0_0_20px_rgba(143,184,150,0.08)]'
                    : ''
                }`}
              >
                <div>
                  {/* Status badge row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded border flex items-center justify-center ${
                        isClaimed
                          ? 'border-[#4a4d46] text-[#4a4d46]'
                          : isUnlocked
                          ? 'border-[#8fb896] text-[#8fb896] bg-[#1a2b1e]'
                          : 'border-[#2b2e2b] text-[#4a4d46]'
                      }`}>
                        {isClaimed
                          ? <CheckCircle2 className="w-4 h-4" />
                          : isUnlocked
                          ? <Sparkles className="w-4 h-4" />
                          : <Lock className="w-4 h-4" />
                        }
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${
                        isClaimed
                          ? 'text-[#4a4d46]'
                          : isUnlocked
                          ? 'text-[#8fb896]'
                          : 'text-[#4a4d46]'
                      }`}>
                        {isClaimed ? 'Claimed' : isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-[#4a4d46] hover:text-[#e06c58] p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-[#cfc8ba] font-mono">{reward.title}</h3>
                  {reward.description && (
                    <p className="text-xs text-[#7a7568] mt-1.5 leading-relaxed">
                      {reward.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#262822] space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7a7568]">Target</span>
                    <span className={`font-bold ${
                      isClaimed ? 'text-[#4a4d46]' : isUnlocked ? 'text-[#8fb896]' : 'text-[#cfc8ba]'
                    }`}>
                      {isClaimed
                        ? 'Complete'
                        : isUnlocked
                        ? 'Goal reached!'
                        : `${reward.pointsNeeded} pts to go`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-[#1b1f23] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isClaimed ? '#4a4d46' : isUnlocked ? '#8fb896' : '#d9a441'
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-[#7a7568]">
                    {currentScore} / {reward.requiredScore} pts
                  </div>

                  {/* Claim button */}
                  {isUnlocked && (
                    <button
                      onClick={() => handleClaimReward(reward.id)}
                      className={`w-full py-2 rounded border text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                        isClaimed
                          ? 'border-[#2b2e2b] text-[#4a4d46] hover:border-[#4a4d46]'
                          : 'border-[#8fb896] text-[#8fb896] hover:bg-[#1a2b1e]'
                      }`}
                    >
                      {isClaimed ? 'Mark Unclaimed' : 'Mark as Claimed'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full consider-card p-12 text-center space-y-4 font-mono">
            <Gift className="w-10 h-10 text-[#2b2e2b] mx-auto" />
            <h4 className="font-bold text-sm text-[#cfc8ba]">No rewards configured</h4>
            <p className="text-xs text-[#7a7568] max-w-sm mx-auto">
              Set milestone scores to unlock treats, books, or activities as you maintain consistency.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-story accent text-xs py-2 px-4 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Reward</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Reward Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121518] border border-[#2b2e2b] rounded max-w-md w-full p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#cfc8ba] uppercase tracking-wider">
                Define New Reward
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7a7568] hover:text-[#cfc8ba]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#7a7568] uppercase mb-1">Reward Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy new football boots"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
              </div>

              <div>
                <label className="block text-[#7a7568] uppercase mb-1">
                  Required Monthly Score (40–100)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={requiredScore}
                  onChange={(e) => setRequiredScore(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
                <div className="mt-1 h-0.5 bg-[#1b1f23] rounded overflow-hidden">
                  <div
                    className="h-full bg-[#d9a441] rounded"
                    style={{ width: `${((requiredScore - 40) / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#7a7568] uppercase mb-1">
                  Description / Motivation
                </label>
                <textarea
                  rows="3"
                  placeholder="What makes this reward meaningful to you?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 rounded bg-[#0e1113] border border-[#262822] text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-story flex-1 justify-center py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-story accent flex-1 justify-center py-2"
                >
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
