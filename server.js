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

// --- API Endpunkt: Einen einzelnen Zeitpunkt speichern ---
app.post('/api/zeiten', async (req, res) => {
    const { zeitpunkt } = req.body;

    if (!zeitpunkt) {
        return res.status(400).json({ error: 'Zeitpunkt fehlt.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO zeiten (zeitpunkt) VALUES ($1) RETURNING *',
            [zeitpunkt]
        );

        res.status(201).json({
            message: 'Zeit erfolgreich gespeichert!',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Datenbankfehler beim Speichern der Zeit:', error);
        res.status(500).json({ 
            error: 'Interner Datenbankfehler.',
            details: error.message 
        });
    }
});

/*
// --- API: Alle Termine abrufen ---
app.get('/api/termine', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM termine ORDER BY start_zeitpunkt ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Fehler beim Abrufen der Termine:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Termine' });
  }
});

// --- API: Termin löschen ---
app.delete('/api/termine/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM termine WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Termin nicht gefunden' });
    }

    res.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error('Fehler beim Löschen des Termins:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Termins' });
  }
});

app.get('/termine', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termine.html'));
});
*/


// --- Static Files ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Server starten ---
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
