#!/usr/bin/env node

// Force Render port configuration
const port = process.env.PORT || 3000;
process.env.PORT = port.toString();

// Set production environment
process.env.NODE_ENV = 'production';

// Start the Next.js server
require('./.next/standalone/server.js');