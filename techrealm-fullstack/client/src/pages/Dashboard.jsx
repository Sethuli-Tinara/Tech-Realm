import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard({ token, onLogout }) {
  const [missions, setMissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({});   // feedback per mission id
  const [advice, setAdvice] = useState('');
  const [interest, setInterest] = useState('');
  const [loadError, setLoadError] = useState('');

  // Load everything once when the page opens.
  const loadAll = async () => {
    try {
      const [m, l, me] = await Promise.all([
        api('/missions', { token }),
        api('/leaderboard', { token }),
        api('/auth/me', { token }),
      ]);
      setMissions(m.missions);
      setLeaderboard(l.leaderboard);
      setUser(me.user);
    } catch (err) {
      if (err.message.includes('session') || err.message.includes('log in')) onLogout();
      else setLoadError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  const answer = async (missionId, index) => {
    try {
      const res = await api(`/missions/${missionId}/answer`, {
        method: 'POST',
        token,
        body: { answer: index },
      });
      setMessage((prev) => ({ ...prev, [missionId]: res.message }));
      if (res.correct) loadAll(); // refresh XP, completed flags and leaderboard
    } catch (err) {
      setMessage((prev) => ({ ...prev, [missionId]: err.message }));
    }
  };

  const askAdvisor = async (e) => {
    e.preventDefault();
    try {
      const res = await api('/advisor', { method: 'POST', token, body: { interest } });
      setAdvice(res.suggestion);
    } catch (err) {
      setAdvice(err.message);
    }
  };

  if (loadError) return <main className="page"><p className="error">{loadError}</p></main>;

  return (
    <main className="page">
      <header className="dash-head">
        <div>
          <p className="eyebrow">Your realm</p>
          <h2>Welcome, {user?.name || 'knight'}</h2>
        </div>
        <div className="xp-badge">{user?.xp ?? 0} XP</div>
      </header>

      <section className="missions">
        {missions.map((m) => (
          <article className={`card mission ${m.completed ? 'done' : ''}`} key={m.id}>
            <span className="tier-number">{m.tier} · {m.xp} XP</span>
            <h3>{m.title} {m.completed && <span className="tag">Completed</span>}</h3>
            <p className="story">{m.story}</p>
            <p><strong>Lesson:</strong> {m.lesson}</p>
            <p><strong>Quiz:</strong> {m.quiz_question}</p>
            <div className="options">
              {m.quiz_options.map((opt, i) => (
                <button key={i} className="btn btn-outline" onClick={() => answer(m.id, i)}>
                  {opt}
                </button>
              ))}
            </div>
            {message[m.id] && <p className="feedback">{message[m.id]}</p>}
          </article>
        ))}
      </section>

      <aside className="side">
        <section className="panel">
          <h3>Path advisor</h3>
          <p>Tell the advisor what you enjoy, such as "web design" or "data".</p>
          <form onSubmit={askAdvisor} className="inline-form">
            <input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="I like..." />
            <button className="btn btn-primary">Ask</button>
          </form>
          {advice && <p className="feedback">{advice}</p>}
        </section>

        <section className="panel">
          <h3>Leaderboard</h3>
          <ol className="board">
            {leaderboard.map((p, i) => (
              <li key={i}><span>{p.name}</span><strong>{p.xp} XP</strong></li>
            ))}
          </ol>
        </section>
      </aside>
    </main>
  );
}
