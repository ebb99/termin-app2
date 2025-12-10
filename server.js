// server.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const pg = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// --- Datenbank-Verbindung (PostgreSQL) ---

const isRailway = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRailway ? { rejectUnauthorized: false } : false
});

// Testen der DB-Verbindung
pool.connect((err, client, done) => {
    if (err) {
        console.error('Fehler beim Verbinden mit der Datenbank:', err);
        return;
    }
    client.release();
    console.log('PostgreSQL-Datenbank verbunden!');
});

// --- API Endpunkt zum Speichern neuer Termine ---
app.post('/api/termine', async (req, res) => {
    const { titel, start_zeitpunkt, ende_zeitpunkt } = req.body;

    if (!titel || !start_zeitpunkt || !ende_zeitpunkt) {
        return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO termine (titel, start_zeitpunkt, ende_zeitpunkt) VALUES ($1, $2, $3) RETURNING *',
            [titel, start_zeitpunkt, ende_zeitpunkt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('--- DETAILLIERTER DB-FEHLER START ---');
        console.error(error);
        console.error('--- DETAILLIERTER DB-FEHLER ENDE ---');

        res.status(500).json({
            error: 'Interner Serverfehler beim Speichern in DB.',
            details: error.message
        });
    }
});

// --- Static Files ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Server starten ---
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
