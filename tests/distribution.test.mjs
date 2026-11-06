import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
test('o pacote distribuível remove dados pessoais da configuração', () => {
  execFileSync(process.execPath, [resolve(root, 'scripts/build-web.mjs')]);
  const config = readFileSync(resolve(root, 'dist/web/config.js'), 'utf8');
  assert.match(config, /googleClientId: ''/);
  assert.match(config, /accountHint: ''/);
  assert.doesNotMatch(config, /@gmail\.com/);
  assert.ok(existsSync(resolve(root, 'dist/web/index.html')));
  assert.ok(existsSync(resolve(root, 'dist/web/db.js')));
  assert.ok(existsSync(resolve(root, 'dist/web/sw.js')));
});
test('PWA usa caminhos relativos, permitindo hospedagem em subpasta', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.webmanifest'), 'utf8'));
  assert.match(html, /\.\/app\.js/);
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
});
test('há configurações para pacotes Android, iOS, desktop e workflow de validação', () => {
  const config = JSON.parse(readFileSync(resolve(root, 'capacitor.config.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.ok(config.appId.startsWith('app.'));
  assert.equal(config.webDir, 'dist/web');
  assert.ok(pkg.scripts['build:windows']);
  assert.ok(pkg.scripts['mobile:android:init']);
  assert.ok(existsSync(resolve(root, 'electron/main.cjs')));
  assert.ok(existsSync(resolve(root, '.github/workflows/build-preview.yml')));
});
