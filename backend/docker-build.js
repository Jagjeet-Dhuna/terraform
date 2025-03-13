require('dotenv').config();
const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const version = packageJson.version;

const environment = process.env.ENVIRONMENT || 'staging'; 

if (!version) {
  console.error('Version not found in package.json');
  process.exit(1);
}

if (!environment) {
  console.error('Environment not set');
  process.exit(1);
}

console.log(`Version: ${version}`);
console.log(`Environment: ${environment}`);


execSync(`docker build -t terkea/mt-backend-k8s:${version}-${environment} .`, { stdio: 'inherit' });
execSync(`docker push terkea/mt-backend-k8s:${version}-${environment}`, { stdio: 'inherit' });