// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware, um JSON-Daten aus dem Frontend zu verarbeiten
app.use(express.json());

// --- Datenbank-Verbindung (PostgreSQL) ---
const pool = new Pool({
    // Nutzt die Umgebungsvariable DATABASE_URL
    connectionString: process.env.DATABASE_URL,
    
    // Wichtig für Railway (Hosting): Railway benötigt meist eine SSL-Verbindung
    // Im Produktions-Modus (NODE_ENV=production) aktivieren wir SSL.
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Testen der Datenbankverbindung beim Start
pool.connect((err, client, done) => {
    if (err) {
        console.error('Fehler beim Verbinden mit der Datenbank', err);
        return;
    }
    client.release();
    console.log('PostgreSQL-Datenbank verbunden!');
});

// --- API Endpunkt zum Speichern neuer Termine ---

app.post('/api/termine', async (req, res) => {
    const { titel, start_zeitpunkt, ende_zeitpunkt } = req.body;

    // Einfache Validierung
    if (!titel || !start_zeitpunkt || !ende_zeitpunkt) {
        return res.status(400).json({ error: 'Bitte alle Felder ausfüllen.' });
    }

        try {
        // Hier passiert die DB-Abfrage
        const result = await pool.query(
            'INSERT INTO termine (titel, start_zeitpunkt, ende_zeitpunkt) VALUES ($1, $2, $3) RETURNING *',
            [titel, start_zeitpunkt, ende_zeitpunkt]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('DB Speichern fehlgeschlagen:', error); // <-- DAS IST WICHTIG
        res.status(500).json({ error: 'Interner Serverfehler beim Speichern in DB.' });
    }
});

// --- Statische Dateien (Frontend) bereitstellen ---

// Express wird angewiesen, alle Dateien im Ordner 'public' als statische Assets auszuliefern
app.use(express.static(path.join(__dirname, 'public')));

// Fallback für das Frontend (stellt sicher, dass index.html geladen wird, wenn man die Basis-URL aufruft)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Server starten ---

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
