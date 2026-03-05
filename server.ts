import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cricket.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    team1_name TEXT,
    team2_name TEXT,
    format TEXT,
    total_overs INTEGER,
    toss_winner TEXT,
    toss_decision TEXT,
    status TEXT DEFAULT 'live',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    match_id TEXT,
    team_id INTEGER, -- 1 or 2
    name TEXT,
    FOREIGN KEY(match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS balls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT,
    inning INTEGER,
    over_num INTEGER,
    ball_num INTEGER,
    batsman_id TEXT,
    bowler_id TEXT,
    runs INTEGER,
    extras INTEGER,
    extra_type TEXT, -- 'wide', 'no_ball', 'bye', 'leg_bye'
    wicket INTEGER DEFAULT 0,
    wicket_type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(match_id) REFERENCES matches(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/matches", (req, res) => {
    const { id, team1, team2, format, overs, tossWinner, tossDecision, players1, players2 } = req.body;
    
    const insertMatch = db.prepare(`
      INSERT INTO matches (id, team1_name, team2_name, format, total_overs, toss_winner, toss_decision)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertPlayer = db.prepare(`
      INSERT INTO players (id, match_id, team_id, name)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      insertMatch.run(id, team1, team2, format, overs, tossWinner, tossDecision);
      players1.forEach((p: any) => insertPlayer.run(p.id, id, 1, p.name));
      players2.forEach((p: any) => insertPlayer.run(p.id, id, 2, p.name));
    });

    transaction();
    res.json({ success: true });
  });

  app.get("/api/matches", (req, res) => {
    const matches = db.prepare("SELECT * FROM matches ORDER BY created_at DESC").all();
    res.json(matches);
  });

  app.get("/api/matches/:id", (req, res) => {
    const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(req.params.id);
    const players = db.prepare("SELECT * FROM players WHERE match_id = ?").all(req.params.id);
    const balls = db.prepare("SELECT * FROM balls WHERE match_id = ? ORDER BY inning, over_num, ball_num").all(req.params.id);
    res.json({ match, players, balls });
  });

  app.post("/api/matches/:id/balls", (req, res) => {
    const { inning, over_num, ball_num, batsman_id, bowler_id, runs, extras, extra_type, wicket, wicket_type } = req.body;
    const insertBall = db.prepare(`
      INSERT INTO balls (match_id, inning, over_num, ball_num, batsman_id, bowler_id, runs, extras, extra_type, wicket, wicket_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertBall.run(req.params.id, inning, over_num, ball_num, batsman_id, bowler_id, runs, extras, extra_type, wicket, wicket_type);
    res.json({ success: true });
  });

  app.post("/api/matches/:id/finish", (req, res) => {
    db.prepare("UPDATE matches SET status = 'completed' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
