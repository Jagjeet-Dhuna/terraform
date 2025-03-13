/* eslint-disable no-undef */
import 'dotenv/config';
import { execSync } from 'child_process';

// Read version and environment from .env file
const version = process.env.VITE_APP_VERSION;
const environment = process.env.VITE_ENVIRONMENT || 'staging'; // Default environment if not set

if (!version) {
  console.error('Version not found in .env file');
  process.exit(1);
}

if (!environment) {
  console.error('Environment not set in .env file');
  process.exit(1);
}

console.log(`Version: ${version}`);
console.log(`Environment: ${environment}`);

// Build and tag Docker image with version-environment format
execSync(`docker build -t terkea/mt-frontend-k8s:${version}-${environment} .`, { stdio: 'inherit' });
execSync(`docker push terkea/mt-frontend-k8s:${version}-${environment}`, { stdio: 'inherit' });