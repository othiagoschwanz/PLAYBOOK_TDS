import assert from 'node:assert/strict';
import test from 'node:test';
import { isAudio, readableSize, timecode, progressKey, driveListUrl } from '../lib.js';

test('somente extensões/tipos de áudio válidos', () => {
  assert.equal(isAudio({ name: 'livro.MP3' }), true);
  assert.equal(isAudio({ name: 'livro.m4b' }), true);
  assert.equal(isAudio({ name: 'video.exe' }), false);
  assert.equal(isAudio({ name: 'audio', mimeType: 'audio/mpeg' }), true);
});
test('tempo, tamanho e progresso por fonte', () => {
  assert.equal(timecode(3661), '1:01:01');
  assert.equal(timecode(-10), '00:00');
  assert.equal(readableSize(1048576), '1.0 MB');
  assert.notEqual(progressKey({source:'local',id:'abc'}), progressKey({source:'drive',id:'abc'}));
});
test('Drive API só lista arquivos não excluídos e devolve campos mínimos', () => {
  const url = new URL(driveListUrl('abc'));
  assert.equal(url.hostname, 'www.googleapis.com');
  assert.ok(url.searchParams.get('q').includes('trashed = false'));
  assert.equal(url.searchParams.get('pageToken'), 'abc');
});
