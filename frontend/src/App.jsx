import { useState, useEffect } from 'react';
import axios from 'axios';
import LogTable from './LogTable';
import './App.css';

function App() {
	console.log(window.config);
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [generatingLogs, setGeneratingLogs] = useState(false); // State to track log generation status
	const [config, setConfig] = useState(null);

	console.log(config);
	useEffect(() => {
		const fetchConfig = async () => {
			try {
				const response = await fetch('/config.json');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const config = await response.json();
				if (config.BACKEND_URL) {
					setConfig(config.BACKEND_URL);
				}
			} catch (error) {
				console.error('Failed to fetch config:', error);
			}
		};

		fetchConfig();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${config}/logs`);
				setData(response.data);
				setError(null);
			} catch (err) {
				setError(err);
				console.error('Error fetching data:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [config]);

	const environment = import.meta.env.VITE_ENVIRONMENT;
	const version = import.meta.env.VITE_APP_VERSION;

	const generateLogs = async () => {
		const getRandomNumber = (min, max) => {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		setGeneratingLogs(true);
		const requests = [];
		for (let i = 0; i < getRandomNumber(50, 100); i++) {
			requests.push(axios.get(`${config}/`));
		}
		try {
			await Promise.all(requests);
			// Refresh data after generating logs
			const response = await axios.get(`${config}/logs`);
			setData(response.data);
			setError(null);
		} catch (err) {
			console.error('Error generating logs:', err);
		} finally {
			setGeneratingLogs(false);
		}
	};

	const deleteLogs = async () => {
		try {
			const response = await fetch(`${config}/logs`, {
				method: 'DELETE',
			});

			// Refresh data after generating logs
			const response2 = await axios.get(`${config}/logs`);
			setData(response2.data);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error deleting logs:', errorData);
			} else {
				const data = await response.json();
				console.log('Logs deleted successfully:', data);
			}
			setError(null);
		} catch (error) {
			console.error('Network error:', error);
		}
	};

	return (
		<div style={{ padding: '20px' }}>
			<header style={{ marginBottom: '20px', textAlign: 'center' }}>
				<h1>MySQL Records from our k8s deployment</h1>
				<h2 style={{ marginBottom: '2rem' }}>
					<strong>Version:</strong> {version} <br />
					<strong>Environment:</strong> {environment}
				</h2>
			</header>

			<div style={{ textAlign: 'center', marginBottom: '20px' }}>
				<button disabled style={{ marginRight: '1rem' }}>
					Total logs: {data.length}
				</button>

				<button onClick={generateLogs} disabled={generatingLogs} style={{ marginRight: '1rem' }}>
					{generatingLogs ? 'Generating Logs...' : 'Generate Logs'}
				</button>

				<button onClick={deleteLogs}>Delete all logs</button>
			</div>

			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p>Error loading data: {error.message}</p>
			) : (
				<LogTable data={data} />
			)}
		</div>
	);
}

export default App;
