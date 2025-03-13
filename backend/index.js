const express = require('express');
const mysql = require('mysql');
const os = require('os');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use CORS middleware to enable CORS for all routes
app.use(cors());

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds

const createDbConnection = () => {
	return mysql.createConnection({
		host: process.env.DB_HOST || 'localhost',
		user: process.env.DB_USER || 'root',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_NAME || 'k8s_lb_logs',
	});
};

const connectWithRetry = (retries) => {
	const db = createDbConnection();

	return new Promise((resolve, reject) => {
		db.connect((err) => {
			if (err) {
				console.error('Failed to connect to database:', err);
				if (retries > 0) {
					console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
					setTimeout(() => {
						connectWithRetry(retries - 1)
							.then(resolve)
							.catch(reject);
					}, RETRY_INTERVAL);
				} else {
					console.error('Max retries reached.');
					reject(new Error('Unable to connect to database after multiple attempts'));
				}
			} else {
				console.log('Successfully connected to database');
				resolve(db);
			}
		});

		db.on('error', (err) => {
			console.error('Database connection error:', err);
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				connectWithRetry(MAX_RETRIES).then(resolve).catch(reject);
			} else {
				reject(err);
			}
		});
	});
};

const insertLog = (db, podName, localTime, version, environment) => {
	// Convert ISO 8601 format to MySQL DATETIME format
	const formattedLocalTime = new Date(localTime).toISOString().replace('T', ' ').replace('Z', '');

	return new Promise((resolve, reject) => {
		db.query(
			'INSERT INTO logs (pod_name, local_time, version, environment) VALUES (?, ?, ?, ?)',
			[podName, formattedLocalTime, version, environment],
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			}
		);
	});
};

const setupRoutes = (db) => {
	app.get('/', async (req, res) => {
		const podName = os.hostname();
		const localTime = new Date().toISOString();
		const version = packageInfo.version; // Get version from package.json
		const environment = process.env.ENVIRONMENT || 'not set'; // Get environment from .env file

		try {
			await insertLog(db, podName, localTime, version, environment);
			res.json({
				podName: podName,
				localTime: localTime,
				version: version,
				environment: environment,
			});
			console.log({
				podName: podName,
				localTime: localTime,
				version: version,
				environment: environment,
			});
		} catch (err) {
			console.error('Database operation error:', err);
			res.status(500).json({
				error: 'Database error',
				details: err.message,
			});
		}
	});

	app.get('/logs', async (req, res) => {
		db.query('SELECT * FROM logs ORDER BY local_time DESC', (err, results) => {
			if (err) {
				console.error('Database query error:', err);
				res.status(500).json({
					error: 'Database error',
					details: err.message,
				});
			} else {
				res.status(200).json(results);
			}
		});
	});

	app.delete('/logs', async (req, res) => {
		db.query('DELETE FROM logs', (err, results) => {
			if (err) {
				// Log the error and respond with a server error status
				console.error('Database query error:', err);
				res.status(500).json({
					error: 'Database error',
					details: err.message,
				});
			} else {
				// Respond with a 200 status and a success message
				res.status(200).json({
					message: 'All records deleted successfully',
					deletedCount: results.affectedRows, // Number of records deleted
				});
			}
		});
	});

	// Handle 404 for unknown routes
	app.use((req, res, next) => {
		res.status(404).json({
			error: 'Not Found',
			message: 'The requested resource could not be found.',
		});
	});

	// General error handler
	app.use((err, req, res, next) => {
		res.status(500).json({
			error: 'Something broke!',
			details: err.message,
		});
	});

	app.listen(port, () => {
		console.log(`App running on http://localhost:${port}`);
	});
};

// Start the connection process
connectWithRetry(MAX_RETRIES)
	.then(setupRoutes)
	.catch((err) => {
		console.error('Failed to establish database connection:', err);
		process.exit(1);
	});
