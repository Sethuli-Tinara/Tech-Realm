// Starter missions. They are added only when the missions table is empty.
// Each mission is one step of the knight story with a "learn" lesson and a quiz.

export const missions = [
  {
    tier: 'Basic',
    title: 'The Gate of Beginnings',
    story: 'A young squire arrives at the gate of the Realm. The guard asks: "What is the first thing a builder must know?"',
    lesson: 'Computers follow instructions exactly. A program is a list of clear steps written in a language the computer understands.',
    quiz_question: 'What is a program?',
    quiz_options: ['A picture on a screen', 'A list of clear steps for a computer', 'A type of battery', 'A web browser'],
    quiz_answer: 1,
    xp: 100,
  },
  {
    tier: 'Intermediate',
    title: 'The Forge of Data',
    story: 'Inside the forge, the blacksmith keeps every record in neat tables so nothing is lost.',
    lesson: 'A database stores data in tables. Each row is one record and each column is one piece of information about it.',
    quiz_question: 'In a database table, what does one row usually represent?',
    quiz_options: ['One column of data', 'One record', 'The table name', 'A password'],
    quiz_answer: 1,
    xp: 150,
  },
  {
    tier: 'Advanced',
    title: 'The Tower of Systems',
    story: 'High in the tower, the wizard connects many small servants so they can talk to each other.',
    lesson: 'Frontend code runs in the browser. Backend code runs on a server, talks to the database, and sends back data through an API.',
    quiz_question: 'Which part of an app usually talks to the database?',
    quiz_options: ['The backend (server)', 'The browser colours', 'The logo image', 'The font file'],
    quiz_answer: 0,
    xp: 200,
  },
  {
    tier: 'PDL',
    title: 'The Quest of Real Projects',
    story: 'The Realm sends you to help a real village build its first website. The villagers need your skills.',
    lesson: 'Employers value real projects. Build small projects, keep them in a shared folder such as GitHub, and explain what you did and why.',
    quiz_question: 'What helps employers see your skills best?',
    quiz_options: ['Saying you know everything', 'Real projects you can show', 'A long list of logos', 'Only your grades'],
    quiz_answer: 1,
    xp: 250,
  },
];
