#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: '0.0.0.0',
  port: process.env.PORT || 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✅ Application is healthy');
    process.exit(0);
  } else {
    console.log('❌ Application returned non-200 status');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();