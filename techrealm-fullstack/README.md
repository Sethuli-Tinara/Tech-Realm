# Tech Realm: Full Stack with Docker

Tech Realm is a gamified learning site. Learners read a knight-themed story mission, learn a short lesson, answer a quiz, and earn XP. The project has three parts, and Docker runs all three together:

| Part | Folder | Technology | What it does |
|---|---|---|---|
| Website | `client/` | React + Vite, served by Nginx | What users see in the browser |
| API | `server/` | Node.js + Express | Logins, missions, quiz checks, XP, leaderboard, path advisor |
| Database | (Docker image) | PostgreSQL 16 | Stores users, missions and completions |

## Before you start: install Docker

1. Download **Docker Desktop** from https://www.docker.com/products/docker-desktop/ and install it.
2. Open Docker Desktop and wait until it says it is running.
3. Check it in a terminal (PowerShell on Windows, Terminal on Mac):

```bash
docker --version
docker compose version
```

## Step 1: Create your secret settings file

Settings that should stay private go in a file called `.env`.

1. In this folder, copy `.env.example` and name the copy `.env`.
   - Windows PowerShell: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`
2. Open `.env` in a text editor and change both values:
   - `POSTGRES_PASSWORD`: any long password you choose.
   - `JWT_SECRET`: a long random text. To make one, run `openssl rand -hex 32` in a terminal (Mac/Linux), or type 64 random letters and numbers.

Never upload `.env` to GitHub. The `.gitignore` file already blocks it.

## Step 2: Start everything

Open a terminal in this folder (the one that contains `docker-compose.yml`) and run:

```bash
docker compose up -d --build
```

The first run takes a few minutes. Docker builds the API and website and starts PostgreSQL.

## Step 3: Open the site

Go to **http://localhost:8080** in your browser.

1. Click **Enter the Realm**.
2. Create an account (name, email, password of 8+ characters).
3. You land in **My Realm**. Read the lesson, pick an answer, and earn XP.
4. Use the **Path advisor** box to get a suggested learning path.

On first start, the API adds four starter missions (Basic, Intermediate, Advanced and PDL) to the database.

## Useful commands

| What you want | Command |
|---|---|
| See what is running | `docker compose ps` |
| See the API logs | `docker compose logs -f api` |
| Stop everything (data is kept) | `docker compose down` |
| Start again | `docker compose up -d` |
| Stop and **delete all data** | `docker compose down -v` |
| Rebuild after code changes | `docker compose up -d --build` |

## Test the API directly (optional)

Once the stack is running, you can test the API through the website's address:

```bash
curl http://localhost:8080/api/health
```

You should see `{"ok":true}`.

## Working on the code without Docker (optional)

You need Node.js 20 or newer and a running PostgreSQL database.

```bash
# Terminal 1: API
cd server
npm install
DATABASE_URL=postgres://techrealm:YOUR_PASSWORD@localhost:5432/techrealm JWT_SECRET=YOUR_SECRET npm run dev

# Terminal 2: website (opens at http://localhost:5173)
cd client
npm install
npm run dev
```

## How the pieces connect

```
Browser ──> web (Nginx, port 8080)
              ├── /        -> React pages (built files)
              └── /api/... -> api (Express, port 4000, inside Docker only)
                                └── db (PostgreSQL, inside Docker only)
```

Only port 8080 is open to your computer. The API and database are reachable only by the other containers. This is safer than opening every port.

## Where to change things

| To change... | Edit this file |
|---|---|
| Mission story, lessons, quiz questions | `server/src/seed.js` |
| Database tables | `server/src/schema.sql` |
| API routes (login, quiz, XP, advisor) | `server/src/index.js` |
| Home page text | `client/src/pages/Home.jsx` |
| Login/register form | `client/src/pages/Auth.jsx` |
| Missions and leaderboard screen | `client/src/pages/Dashboard.jsx` |
| Colours and layout | `client/src/styles.css` |

**Note about changing missions:** the starter missions are added only when the `missions` table is empty. To reload them after editing `seed.js`, run `docker compose down -v` and then `docker compose up -d --build`. This deletes all user accounts too.

## Troubleshooting

- **"port is already allocated"**: another program uses port 8080. Change `"8080:8080"` in `docker-compose.yml` to `"3000:8080"` and open http://localhost:3000.
- **`POSTGRES_PASSWORD` or `JWT_SECRET` error**: you did not create the `.env` file (Step 1), or a value is missing.
- **API keeps restarting**: run `docker compose logs api`. The most common cause is a wrong password in `.env` after the database was first created. Run `docker compose down -v` to start fresh (this deletes data).
- **Website says "Something went wrong"**: check the API logs with `docker compose logs -f api`.
- **Login does not stay after refresh**: make sure the browser allows local storage (not in private mode with strict settings).

## Security notes for learning

- Passwords are stored as bcrypt hashes, never as plain text.
- Login tokens expire after 7 days.
- Quiz correct answers are checked on the server and never sent to the browser.
- Before a real launch, add HTTPS (for example with a reverse proxy such as Caddy), stronger rate limits on login, and a privacy policy.
