export const AUDIO_EXT = /\.(mp3|m4a|m4b|aac|ogg|oga|wav|flac|opus)$/i;
export function isAudio(file) {
  return Boolean(file && (AUDIO_EXT.test(file.name || '') || /^audio\//.test(file.mimeType || file.type || '')));
}
export function readableSize(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
}
export function timecode(value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  const h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
export function progressKey(book) {
  return `${book.source}:${book.id}:${book.modifiedTime || book.size || ''}`;
}
export function driveListUrl(pageToken = '') {
  const params = new URLSearchParams({ q: "trashed = false and (mimeType contains 'audio/' or mimeType = 'application/octet-stream')", fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime)', pageSize: '1000', orderBy: 'name', spaces: 'drive' });
  if (pageToken) params.set('pageToken', pageToken);
  return 'https://www.googleapis.com/drive/v3/files?' + params;
}
