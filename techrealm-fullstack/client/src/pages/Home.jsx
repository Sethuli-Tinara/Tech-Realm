import { Link } from 'react-router-dom';

const tiers = [
  { name: 'Basic', text: 'Learn how programs and computers work.' },
  { name: 'Intermediate', text: 'Build with data, tables and logic.' },
  { name: 'Advanced', text: 'Connect frontend, backend and databases.' },
  { name: 'PDL', text: 'Prove your skills with real-world projects.' },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Gamified professional learning</p>
        <h1>
          Build your skills. <span className="grad">Build your kingdom.</span> Build your future.
        </h1>
        <p className="lead">
          Discover your pathway, clear four tiers of missions, earn XP, and grow toward real
          opportunities in software.
        </p>
        <Link to="/login" className="btn btn-primary btn-large">Start your quest</Link>
      </section>

      <section className="tiers">
        {tiers.map((t, i) => (
          <div className="card" key={t.name}>
            <span className="tier-number">0{i + 1}</span>
            <h3>{t.name}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
