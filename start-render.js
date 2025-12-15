#!/usr/bin/env node

// Script de start para o Render
const { spawn } = require('child_process');

// Força a porta do Render
const port = process.env.PORT || 10000;
process.env.PORT = port.toString();
process.env.HOSTNAME = '0.0.0.0';

console.log(`Starting Next.js on port ${port} with hostname 0.0.0.0`);

// Inicia o Next.js com as configurações corretas
const nextProcess = spawn('next', ['start', '-p', port.toString()], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port.toString(),
    HOSTNAME: '0.0.0.0',
    NODE_ENV: 'production'
  }
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js exited with code ${code}`);
  process.exit(code);
});