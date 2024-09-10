const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // Use axios to make HTTP requests

const app = express();
const port = 3000;

// Cohere API details
const COHERE_API_URL = 'https://api.cohere.ai/v1/generate';
const COHERE_API_KEY = 'blHaJr21ILroCAEmyH4grHvFTqBwAFtW9GKTvD8t';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('frontend'));

// Initialize SQLite database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        bed_number INTEGER NOT NULL
    )`);

    db.run(`CREATE TABLE dispensed_medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        medicine_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE medicine_inventory (
        medicine_name TEXT PRIMARY KEY,
        stock INTEGER NOT NULL
    )`);
});

// Array to store logs
const logs = [];

// Function to add a log
const addLog = (message) => {
    const timestamp = new Date().toISOString();
    logs.push({ message, timestamp });
    console.log(`[${timestamp}] ${message}`);
};

// Route to admit a patient
app.post('/admit-patient', (req, res) => {
    const { name, department, bed_number } = req.body;
    const logMessage = `Patient admitted: ${name}, ${department}, Bed Number: ${bed_number}`;
    addLog(logMessage);

    const stmt = db.prepare('INSERT INTO patients (name, department, bed_number) VALUES (?, ?, ?)');
    stmt.run(name, department, bed_number, function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ success: true, id: this.lastID });
        }
    });
    stmt.finalize();
});

// Route to log medicine and stock details to the terminal
app.post('/log-medicine-stock', (req, res) => {
    const { medicine_name, stock } = req.body;
    const logMessage = `Medicine Added: ${medicine_name}, Stock: ${stock}`;
    addLog(logMessage);
    res.json({ success: true });
});

// Route to get bed availability
app.get('/bed-availability', (req, res) => {
    db.all('SELECT * FROM patients', [], (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        
        const totalBeds = 10;
        const occupiedBeds = rows.length;
        const availableBeds = totalBeds - occupiedBeds;
        const availableBedsList = Array.from({ length: totalBeds }, (_, i) => i + 1).filter(bed => !rows.some(row => row.bed_number === bed));

        res.json({
            totalBeds,
            occupiedBeds,
            availableBeds,
            availableBedsList,
            admittedPatients: rows
        });
    });
});

// Route to dispense medicine
app.post('/dispense-medicine', (req, res) => {
    const { patient_name, medicine_name } = req.body;
    const logMessage = `Medicine dispensed: ${patient_name}, Medicine: ${medicine_name}`;
    addLog(logMessage);

    const stmt = db.prepare('INSERT INTO dispensed_medicines (patient_name, medicine_name) VALUES (?, ?)');
    stmt.run(patient_name, medicine_name, function (err) {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({ success: true, id: this.lastID });
        }
    });
    stmt.finalize();
});

// Route to log inventory details
app.post('/log-inventory', (req, res) => {
    const inventory = req.body;
    addLog('Current Inventory Stock:');
    for (const [medicine, stock] of Object.entries(inventory)) {
        addLog(`${medicine}: ${stock} left`);
    }
    res.json({ success: true });
});

// Route to get logs
app.get('/fetch-logs', (req, res) => {
    res.json({ success: true, logs });
});


// Route to get medicine description from Cohere
app.post('/get-medicine-description', async (req, res) => {
    const { medicine_name } = req.body;

    if (!medicine_name) {
        return res.status(400).json({ success: false, error: 'Medicine name is required.' });
    }

    try {
        const response = await axios.post(COHERE_API_URL, {
            prompt: `Describe the medicine: ${medicine_name}`,
            max_tokens: 50,
        }, {
            headers: {
                Authorization: `Bearer ${COHERE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Cohere API response:', response.data); // Log the response

        if (response.data.generations && response.data.generations.length > 0) {
            const description = response.data.generations[0].text.trim();
            res.json({ success: true, description });
        } else {
            res.json({ success: false, error: 'Description not available.' });
        }
    } catch (error) {
        console.error('Error interacting with Cohere API:', error);
        res.status(500).json({ success: false, error: 'Failed to get description from Cohere API.' });
    }
});

// Route to get logs using Server-Sent Events (SSE)
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send log updates
    const sendLogUpdate = () => {
        res.write(`data: ${JSON.stringify(logs)}\n\n`);
    };

    // Send log updates every 5 seconds (for demo purposes)
    const intervalId = setInterval(sendLogUpdate, 5000);

    // Clear the interval when the connection is closed
    
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
