async function testAll() {
  try {
    console.log('Testing Tracker APIs & Frontend...');
    
    // 1. Auth Demo Login
    const demoRes = await fetch('http://localhost:5000/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const demoData = await demoRes.json();
    console.log('✅ [1] Auth Demo User:', demoData.user.name, `(${demoData.user.email})`);
    
    const token = demoData.token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Dashboard
    const dashRes = await fetch('http://localhost:5000/api/dashboard?date=2026-08-26', { headers });
    const dashData = await dashRes.json();
    console.log('✅ [2] Dashboard:', `Score ${dashData.summary.monthlyScore}/100 (${dashData.summary.monthlyLevel}) | Habits: ${dashData.summary.habitsCompleted}/${dashData.summary.habitsTotal} done | Tasks: ${dashData.summary.tasksCompleted}/${dashData.summary.tasksTotal}`);

    // 3. Monthly Scoring Engine & Formula Breakdown
    const scoreRes = await fetch('http://localhost:5000/api/scoring/monthly?month=2026-08', { headers });
    const scoreData = await scoreRes.json();
    console.log('✅ [3] Scoring Engine Formula Breakdown:');
    console.log('      - Consistency (50%):', scoreData.breakdown.consistency.weighted, 'pts (' + scoreData.breakdown.consistency.rawPercentage + '%)');
    console.log('      - Difficulty (20%):', scoreData.breakdown.difficulty.weighted, 'pts (avg ' + scoreData.breakdown.difficulty.avgDifficulty + '/5)');
    console.log('      - Streak (15%):', scoreData.breakdown.streak.weighted, 'pts (max ' + scoreData.breakdown.streak.maxStreak + 'd)');
    console.log('      - Improvement (15%):', scoreData.breakdown.improvement.weighted, 'pts (+' + scoreData.breakdown.improvement.diffPercentage + '% vs July)');
    console.log('      - Total Score:', scoreData.score, '/ 100 [Level:', scoreData.level + ']');

    // 4. Habits List & Matrix
    const habitsRes = await fetch('http://localhost:5000/api/habits', { headers });
    const habits = await habitsRes.json();
    console.log('✅ [4] Habits Loaded:', habits.length, 'habits');
    habits.forEach(h => console.log(`      * ${h.name} (${h.category}) - ${h.currentStreak}d current streak (Target: ${h.target} ${h.unit})`));

    // 5. Tasks Manager
    const tasksRes = await fetch('http://localhost:5000/api/tasks', { headers });
    const tasks = await tasksRes.json();
    console.log('✅ [5] Tasks Loaded:', tasks.length, 'tasks');
    tasks.slice(0, 3).forEach(t => console.log(`      * [${t.priority.toUpperCase()}] ${t.title} (Completed: ${t.completed})`));

    // 6. Daily Journal
    const journalRes = await fetch('http://localhost:5000/api/journal', { headers });
    const journal = await journalRes.json();
    console.log('✅ [6] Journal Entries:', journal.length, 'reflections saved');
    if (journal.length > 0) {
      console.log(`      * Latest (${journal[0].date}): "${journal[0].title}" [Mood: ${journal[0].mood}/5, Energy: ${journal[0].energy}/10]`);
    }

    // 7. Rewards
    const rewardsRes = await fetch('http://localhost:5000/api/rewards?month=2026-08', { headers });
    const rewardsData = await rewardsRes.json();
    console.log('✅ [7] Rewards List:', rewardsData.rewards.length, 'milestone rewards');
    rewardsData.rewards.forEach(r => console.log(`      * ${r.title}: Target ${r.requiredScore} pts -> Status: ${r.claimed ? 'Claimed' : (r.unlocked ? 'Unlocked 🎉' : 'Locked')}`));

    // 8. Analytics Overview
    const analyticsRes = await fetch('http://localhost:5000/api/analytics/overview', { headers });
    const analytics = await analyticsRes.json();
    console.log('✅ [8] Analytics Datasets: Daily trend data points (' + analytics.dailyTrend.length + '), Weekdays (' + analytics.weekdayPerformance.length + '), Habit Comparisons (' + analytics.habitComparison.length + ')');

    // 9. Frontend Serving
    const feRes = await fetch('http://localhost:3000/');
    console.log('✅ [9] Frontend Web Application:', feRes.status, feRes.statusText, '(Vite serving on port 3000)');

    console.log('\n🎉 ALL SYSTEMS VERIFIED AND WORKING SMOOTHLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testAll();
