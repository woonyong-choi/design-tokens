import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { exportDesign } from '../ui/build/export.mjs';

const [destination] = process.argv.slice(2);
if (!destination || process.argv.length !== 3) throw new Error('usage: export.mjs <destination>');
const manifest = exportDesign(fileURLToPath(new URL('../dist', import.meta.url)), resolve(destination));
console.log(`${manifest.contentHash} -> ${resolve(destination)}`);
