import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(import.meta.dirname, '..');
const output = resolve(source, 'dist', 'web');
const publicFiles = [
  'index.html', 'app.js', 'lib.js', 'db.js', 'styles.css', 'sw.js',
  'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'
];
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const name of publicFiles) cpSync(resolve(source, name), resolve(output, name));
// Release builds must not contain a publisher's account email, OAuth token or credentials.
writeFileSync(resolve(output, 'config.js'),
  "window.PLAYBOOK_CONFIG = { googleClientId: '', accountHint: '' };\n");
console.log(`PLAYBOOK V02: arquivos neutros para distribuição em ${output}`);
