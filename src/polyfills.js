import { Buffer } from 'buffer';

// Polyfill standar untuk Stacks.js di browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
  window.process = { env: {} }; // Beberapa lib butuh process.env
}
