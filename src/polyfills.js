// src/polyfills.js
import { Buffer } from 'buffer';

window.global = window;
window.Buffer = Buffer;
globalThis.Buffer = Buffer;
