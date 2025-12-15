#!/usr/bin/env node

// Force Render port configuration
const port = process.env.PORT || 3000;
process.env.PORT = port.toString();
process.env.HOSTNAME = '0.0.0.0';

// Set production environment
process.env.NODE_ENV = 'production';

console.log(`Starting server on port ${port} with hostname 0.0.0.0`);

// Start the Next.js server
require('./.next/standalone/server.js');