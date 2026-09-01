// Login do /dashboard: senha única (env DASHBOARD_PASSWORD) → token HMAC com validade.
import { createHmac, timingSafeEqual } from 'node:crypto';

const PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const SECRET = process.env.DASHBOARD_SECRET || '';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export const authConfigured = () => PASSWORD.length >= 8 && SECRET.length >= 16;

const sign = (payload) => createHmac('sha256', SECRET).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkPassword(candidate) {
  return authConfigured() && safeEqual(candidate || '', PASSWORD);
}

export function issueToken() {
  const exp = String(Date.now() + TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token) {
  if (!authConfigured() || typeof token !== 'string') return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sign(exp), sig);
}

export function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}
