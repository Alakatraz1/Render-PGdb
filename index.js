import express from 'express';
import dotenv from 'dotenv';
import pkg from 'pg';  // Import the pg module as a default import
const { Pool } = pkg;  // Extract the Pool object from the default import
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// PostgreSQL connection pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: 'true',  // Ensure SSL is enabled if required
});

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to render the SQL query page
app.get('/', (req, res) => {
  res.render('index', { result: null, error: null });
});

// Route to perform custom SQL queries
app.post('/query', async (req, res) => {
  const { sqlQuery } = req.body;  // Expecting SQL query to be sent in the request body

  if (!sqlQuery) {
    return res.render('index', { result: null, error: 'No SQL query provided' });
  }

  try {
    const result = await pool.query(sqlQuery);  // Execute the query
    res.render('index', { result: result.rows, error: null });  // Send results back to the client
  } catch (err) {
    console.error(err);
    res.render('index', { result: null, error: 'Error executing SQL query' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
