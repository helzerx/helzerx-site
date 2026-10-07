import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_SITE_SETTINGS,
  INITIAL_SITE_IMAGES,
  INITIAL_GAMES,
  INITIAL_PLANS,
  INITIAL_GENERAL_SERVICES,
  INITIAL_TLDS,
  INITIAL_SERVER_LOCATIONS,
  INITIAL_COMPARISON_ROWS,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_PARTNERS,
  INITIAL_REVIEWS,
  INITIAL_BLOG_POSTS,
  INITIAL_COUPONS,
  CURRENCIES,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_STATUS_COMPONENTS,
  INITIAL_STATUS_INCIDENTS,
  INITIAL_SERVER_NODES,
  INITIAL_ADMIN_USERS,
} from './src/data/initialData';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const LEGACY_DATA_DIR = path.resolve(__dirname, 'data');
const DATA_DIR = path.resolve(
  process.env.ARVEX_DATA_DIR
    || (String(process.env.NODE_ENV || '').toLowerCase() === 'production' ? '/var/lib/helzerx/data' : LEGACY_DATA_DIR)
);
const CMS_FILE = path.join(DATA_DIR, 'cms.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'auth-sessions.json');
const ORDERS_FILE = path.join(DATA_DIR, 'payment-orders.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const SECURITY_LOGS_FILE = path.join(DATA_DIR, 'security-logs.json');
const PTERODACTYL_TOKENS_FILE = path.join(DATA_DIR, 'pterodactyl-client-tokens.json');

async function appendSecurityLog(entry: {
  actor: string;
  type: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  severity?: 'info' | 'warning' | 'critical';
}) {
  try {
    const logs = await readJson<any[]>(SECURITY_LOGS_FILE, []);
    logs.unshift({
      id: `sec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      severity: entry.severity || 'info',
      ...entry,
    });
    if (logs.length > 500) logs.length = 500;
    await atomicWrite(SECURITY_LOGS_FILE, logs);
  } catch (err) {
    console.error('Error writing security log:', err);
  }
}

const NODE_ENV = String(process.env.NODE_ENV || 'development').trim().toLowerCase();
function requiredProductionSecret(name: string, value: string): string {
  if (NODE_ENV === 'production' && !value) {
    throw new Error(`Missing required production secret: ${name}`);
  }
  return value;
}

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'admin@helzerx.cloud').trim().toLowerCase();
const ADMIN_PASSWORD = requiredProductionSecret('ADMIN_PASSWORD', String(process.env.ADMIN_PASSWORD || ''));
const TOKEN_SECRET = requiredProductionSecret('ADMIN_TOKEN_SECRET', String(process.env.ADMIN_TOKEN_SECRET || ''));
const PUBLIC_ORIGIN = String(process.env.PUBLIC_ORIGIN || '').trim().replace(/\/+$/, '');
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const RESEND_FROM = String(process.env.RESEND_FROM || '').trim();
const PAYHERE_MERCHANT_ID = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
const PAYHERE_MERCHANT_SECRET = String(process.env.PAYHERE_MERCHANT_SECRET || '').trim();
const PAYHERE_SANDBOX = String(process.env.PAYHERE_SANDBOX || 'true').toLowerCase() === 'true';
const USD_TO_LKR = Number(process.env.PAYHERE_USD_TO_LKR || 300);
const PTERODACTYL_URL = String(process.env.PTERODACTYL_URL || '').trim().replace(/\/+$/, '');
const PTERODACTYL_APPLICATION_TOKEN = String(process.env.PTERODACTYL_APPLICATION_TOKEN || '').trim();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

interface SessionData {
  userId: string;
  role: 'admin' | 'customer';
  email: string;
  provider: string;
  createdAt: number;
  expiresAt: number;
}

interface OtpChallenge {
  type: 'admin' | 'register' | 'login' | 'reset';
  code: string;
  codeHash: string;
  email: string;
  user?: any;
  userId?: string;
  expiresAt: number;
  attempts: number;
}

const otpChallenges = new Map<string, OtpChallenge>();
const inMemorySessions = new Map<string, SessionData>();

// Helpers
async function ensurePersistentDataStore(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 });

  // One-time migration from the old repository-local data directory.
  // Runtime/auth data is no longer read from tracked files, so git pull/reset
  // cannot replace customer accounts or payment records.
  if (DATA_DIR === LEGACY_DATA_DIR) return;

  const filesToMigrate = [
    'users.json',
    'auth-sessions.json',
    'payment-orders.json',
    'payments.json',
    'security-logs.json',
    'pterodactyl-client-tokens.json',
    'cms.json',
  ];

  for (const name of filesToMigrate) {
    const source = path.join(LEGACY_DATA_DIR, name);
    const target = path.join(DATA_DIR, name);
    try {
      await fs.access(target);
      continue;
    } catch {}

    try {
      const raw = await fs.readFile(source);
      await fs.writeFile(target, raw, { mode: 0o600 });
      console.log(`[HelzerX Data] Migrated ${name} to persistent storage.`);
    } catch {}
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function atomicWrite(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(temp, file);
}

function safeEqual(a: string | Buffer, b: string | Buffer): boolean {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function passwordHash(password: string, salt = crypto.randomBytes(16).toString('hex')): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derived) => {
      if (err) reject(err);
      else resolve(`${salt}:${derived.toString('hex')}`);
    });
  });
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  return safeEqual(await passwordHash(password, salt), `${salt}:${hash}`);
}

function signAdminToken(payload: { role: string; email: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyAdminToken(token: string): boolean {
  try {
    const [body, signature] = String(token || '').split('.');
    if (!body || !signature || !TOKEN_SECRET) return false;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url');
    if (!safeEqual(signature, expected)) return false;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.role === 'admin' && Number(payload.exp) > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = String(req.headers.cookie || '');
  return Object.fromEntries(
    header.split(';').map((part) => {
      const idx = part.indexOf('=');
      if (idx < 0) return [part.trim(), ''];
      return [part.slice(0, idx).trim(), decodeURIComponent(part.slice(idx + 1).trim())];
    }).filter(([k]) => Boolean(k))
  );
}

function setSessionCookie(res: Response, sessionId: string) {
  res.setHeader('Set-Cookie', [
    `arvex_secure_session=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
    `arvex_session=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ]);
}

function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', [
    'arvex_secure_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    'arvex_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  ]);
}

function createSession(user: { id: string; role: 'admin' | 'customer'; email: string; provider?: string }): string {
  const now = Date.now();
  const session: SessionData = {
    userId: user.id,
    role: user.role,
    email: user.email,
    provider: user.provider || 'email',
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(`session.${body}`).digest('base64url');
  return `${body}.${signature}`;
}

function getSession(req: Request): SessionData | null {
  const cookies = parseCookies(req);
  const token = cookies.arvex_secure_session || cookies.arvex_session;
  if (!token) return null;

  try {
    const [body, signature] = token.split('.');
    if (!body || !signature || !TOKEN_SECRET) return null;
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(`session.${body}`).digest('base64url');
    if (!safeEqual(signature, expected)) return null;

    const session = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionData;
    if (!session?.userId || !['admin', 'customer'].includes(session.role)) return null;
    if (!session.expiresAt || Number(session.expiresAt) <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function publicUser(user: any) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName || user.name?.split(' ')[0] || '',
    lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email,
    role: user.role || 'customer',
    provider: user.provider || 'email',
    avatar: user.avatar || '',
    phone: user.phone || '',
    country: user.country || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    postalCode: user.postalCode || '',
    company: user.company || '',
    accountType: user.accountType || 'individual',
    createdAt: user.createdAt,
    emailVerified: Boolean(user.emailVerified),
  };
}


function pterodactylSecretKey(): Buffer {
  return crypto.createHash('sha256').update(TOKEN_SECRET || 'development-only-secret').digest();
}

function encryptPterodactylToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', pterodactylSecretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString('base64url')).join('.');
}

function decryptPterodactylToken(value: string): string | null {
  try {
    const [ivRaw, tagRaw, dataRaw] = String(value || '').split('.');
    if (!ivRaw || !tagRaw || !dataRaw) return null;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      pterodactylSecretKey(),
      Buffer.from(ivRaw, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(dataRaw, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}

async function getPterodactylClientToken(userId: string): Promise<string | null> {
  const store = await readJson<Record<string, string>>(PTERODACTYL_TOKENS_FILE, {});
  const encrypted = store[String(userId || '')];
  return encrypted ? decryptPterodactylToken(encrypted) : null;
}

async function savePterodactylClientToken(userId: string, token: string): Promise<void> {
  const store = await readJson<Record<string, string>>(PTERODACTYL_TOKENS_FILE, {});
  store[String(userId)] = encryptPterodactylToken(token);
  await atomicWrite(PTERODACTYL_TOKENS_FILE, store);
}

async function removePterodactylClientToken(userId: string): Promise<void> {
  const store = await readJson<Record<string, string>>(PTERODACTYL_TOKENS_FILE, {});
  delete store[String(userId)];
  await atomicWrite(PTERODACTYL_TOKENS_FILE, store);
}

function pterodactylClientHeaders(token: string, contentType = 'application/json') {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'Application/vnd.pterodactyl.v1+json',
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };
}

async function pterodactylClientRequest(
  token: string,
  pathname: string,
  init: RequestInit = {}
): Promise<{ response: globalThis.Response; payload: any }> {
  if (!PTERODACTYL_URL) throw new Error('Pterodactyl URL is not configured.');
  const url = new URL(pathname, PTERODACTYL_URL);
  const response = await fetch(url, {
    ...init,
    headers: {
      ...pterodactylClientHeaders(token, String(init.body ? 'application/json' : 'application/json')),
      ...(init.headers || {}),
    },
    signal: init.signal || AbortSignal.timeout(15000),
  });
  const text = await response.text().catch(() => '');
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  return { response, payload };
}

function pterodactylPublicServer(attrs: any) {
  const allocation = Array.isArray(attrs?.relationships?.allocations?.data)
    ? attrs.relationships.allocations.data.find((item: any) => item?.attributes?.is_default)
      || attrs.relationships.allocations.data[0]
    : null;
  const a = allocation?.attributes || {};
  return {
    identifier: String(attrs?.identifier || ''),
    uuid: String(attrs?.uuid || ''),
    name: String(attrs?.name || 'Unnamed server'),
    description: String(attrs?.description || ''),
    node: String(attrs?.node || ''),
    status: String(attrs?.status || 'unknown'),
    suspended: Boolean(attrs?.is_suspended ?? attrs?.suspended),
    installing: Boolean(attrs?.is_installing),
    transferring: Boolean(attrs?.is_transferring),
    limits: {
      memory: Number(attrs?.limits?.memory || 0),
      disk: Number(attrs?.limits?.disk || 0),
      cpu: Number(attrs?.limits?.cpu || 0),
      swap: Number(attrs?.limits?.swap || 0),
    },
    featureLimits: {
      databases: Number(attrs?.feature_limits?.databases || 0),
      allocations: Number(attrs?.feature_limits?.allocations || 0),
      backups: Number(attrs?.feature_limits?.backups || 0),
    },
    permissions: Array.isArray(attrs?.user_permissions) ? attrs.user_permissions.map(String) : [],
    allocation: a?.ip ? {
      ip: String(a.ip),
      alias: a.ip_alias ? String(a.ip_alias) : null,
      port: Number(a.port || 0),
    } : null,
    sftp: attrs?.sftp_details ? {
      ip: String(attrs.sftp_details.ip || ''),
      port: Number(attrs.sftp_details.port || 0),
    } : null,
  };
}

async function requireClientPortalSession(req: Request, res: Response): Promise<{ session: SessionData; user: any; token: string } | null> {
  const session = getSession(req);
  if (!session || session.role !== 'customer') {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  const users = await readJson<any[]>(USERS_FILE, []);
  const user = users.find((candidate) => candidate.id === session.userId && !candidate.banned);
  if (!user) {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Session is no longer valid.' });
    return null;
  }
  const token = await getPterodactylClientToken(user.id);
  if (!PTERODACTYL_URL || !token) {
    res.status(409).json({ error: 'Connect your Pterodactyl client API key to use live controls.' });
    return null;
  }
  return { session, user, token };
}

function buildSecurityEmail(code: string, title: string, intro: string, label: string) {
  const year = new Date().getFullYear();
  const text = [
    title,
    '',
    intro,
    '',
    `${label}: ${code}`,
    '',
    'This code expires in 10 minutes.',
    'If you did not request this email, you can safely ignore it.',
    '',
    'HelzerX Cloud',
    'https://helzerx.cyou',
    '',
    `© ${year} HelzerX Cloud. All rights reserved.`,
  ].join('\\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#211936">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#ffffff;border:1px solid #e7e0f7;border-radius:18px;overflow:hidden">
        <div style="padding:22px 28px;background:#6d28d9">
          <div style="font-size:18px;line-height:1;font-weight:800;color:#ffffff;letter-spacing:.2px">HelzerX Cloud</div>
          <div style="margin-top:7px;font-size:11px;line-height:1.4;color:#e9ddff;letter-spacing:1.2px;text-transform:uppercase">Secure account verification</div>
        </div>

        <div style="padding:30px 28px">
          <h1 style="margin:0 0 10px;font-size:24px;line-height:1.3;color:#24134f">${title}</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#625c72">${intro}</p>

          <div style="border:1px solid #e5def5;border-radius:14px;background:#faf8ff;padding:20px;text-align:center">
            <div style="font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#7656a8">${label}</div>
            <div style="margin-top:10px;font-size:36px;line-height:1.1;font-weight:800;letter-spacing:8px;color:#5b21b6">${code}</div>
          </div>

          <div style="margin-top:20px;padding:14px 16px;border-radius:10px;background:#f8f7fb;color:#6b6575;font-size:12px;line-height:1.7">
            <strong style="color:#40394d">Valid for 10 minutes.</strong><br>
            If you did not request this email, you can safely ignore it.
          </div>

          <div style="margin-top:24px;padding-top:18px;border-top:1px solid #eeeaf4;font-size:11px;line-height:1.7;color:#817a90">
            This is an automated security email from HelzerX Cloud.<br>
            <a href="https://helzerx.cyou" style="color:#6d28d9;text-decoration:none;font-weight:600">helzerx.cyou</a>
          </div>
        </div>

        <div style="padding:16px 28px;background:#211936;text-align:center;color:#cfc7df;font-size:10px;line-height:1.6">
          © ${year} HelzerX Cloud. All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>`;
  return { text, html };
}
async function sendMail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  if (!RESEND_API_KEY || !RESEND_FROM) {
    console.error('[HelzerX Email] Resend is not configured. Set RESEND_API_KEY and RESEND_FROM.');
    return false;
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, text, ...(html ? { html } : {}), headers: { 'X-Entity-Ref-ID': `helzerx-otp-${crypto.randomUUID()}` } }),
        signal: AbortSignal.timeout(20000),
      });

      const details = await res.text().catch(() => '');

      if (res.ok) {
        let messageId = '';
        try {
          messageId = String(JSON.parse(details)?.id || '');
        } catch {}

        console.log(
          `[HelzerX Email] Resend accepted email to ${to} (attempt ${attempt})${messageId ? ` id=${messageId}` : ''}`
        );
        return true;
      }

      const transient = res.status === 408 || res.status === 429 || res.status >= 500;
      console.error(
        `[HelzerX Email] Resend rejected email (${res.status}, attempt ${attempt}): ${details}`
      );

      if (!transient || attempt === maxAttempts) return false;
    } catch (err) {
      console.error(
        `[HelzerX Email] Resend request failed (attempt ${attempt}/${maxAttempts}):`,
        err
      );
      if (attempt === maxAttempts) return false;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }

  return false;
}

// Seed initial CMS config if empty or not found
async function ensureCmsConfigInitialized() {
  const current = await readJson<Record<string, unknown>>(CMS_FILE, {});
  if (!current.plans || !current.siteSettings) {
    const seed = {
      siteSettings: INITIAL_SITE_SETTINGS,
      siteImages: {
        ...INITIAL_SITE_IMAGES,
        logoUrl: 'https://www.image2url.com/r2/default/images/1787805975676-5a4d373d-c6bd-4d39-bb64-1336474f4a7a.png',
      },
      games: INITIAL_GAMES,
      plans: INITIAL_PLANS,
      generalServices: INITIAL_GENERAL_SERVICES,
      tlds: INITIAL_TLDS,
      locations: INITIAL_SERVER_LOCATIONS,
      comparisonRows: INITIAL_COMPARISON_ROWS,
      faqs: INITIAL_FAQS,
      testimonials: INITIAL_TESTIMONIALS,
      partners: INITIAL_PARTNERS,
      reviews: INITIAL_REVIEWS,
      blogPosts: INITIAL_BLOG_POSTS,
      coupons: INITIAL_COUPONS,
      currenciesList: CURRENCIES,
      currency: CURRENCIES[1] || CURRENCIES[0],
      paymentSettings: INITIAL_PAYMENT_SETTINGS,
      statusComponents: INITIAL_STATUS_COMPONENTS,
      statusIncidents: INITIAL_STATUS_INCIDENTS,
      serverNodes: INITIAL_SERVER_NODES,
      adminUsers: INITIAL_ADMIN_USERS,
    };
    await atomicWrite(CMS_FILE, seed);
    console.log('[HelzerX CMS] Seeded default CMS configuration to data/cms.json');
  }
}

async function start() {
  await ensurePersistentDataStore();
  await ensureCmsConfigInitialized();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // CORS and origin handling
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health
  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'arvex-hosting', time: new Date().toISOString() }));
  app.get('/api/payments/health', (_req, res) => res.json({ ok: true, service: 'arvex-payments', payhereConfigured: Boolean(PAYHERE_MERCHANT_ID) }));
  app.get('/api/automation/health', (_req, res) => res.json({ ok: true, service: 'arvex-automation' }));
  app.get('/automation-health', (_req, res) => res.json({ ok: true, service: 'arvex-automation' }));

  // CMS
  const PUBLIC_CMS_KEYS = new Set([
    'siteSettings', 'siteImages', 'games', 'plans', 'generalServices', 'tlds',
    'locations', 'comparisonRows', 'faqs', 'testimonials', 'partners', 'reviews',
    'blogPosts', 'currenciesList', 'currency', 'statusComponents', 'statusIncidents',
  ]);

  app.get('/api/cms/config', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    const config = await readJson<Record<string, unknown>>(CMS_FILE, {});
    const publicConfig: Record<string, unknown> = {};
    for (const key of PUBLIC_CMS_KEYS) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        publicConfig[key] = config[key];
      }
    }
    res.json(publicConfig);
  });

  app.post('/api/cms/config/:key', async (req, res) => {
    const { key } = req.params;
    const config = await readJson<Record<string, unknown>>(CMS_FILE, {});
    config[key] = req.body?.value;
    await atomicWrite(CMS_FILE, config);
    res.json({ ok: true, key });
  });

  app.delete('/api/cms/config/:key', async (req, res) => {
    const { key } = req.params;
    const config = await readJson<Record<string, unknown>>(CMS_FILE, {});
    delete config[key];
    await atomicWrite(CMS_FILE, config);
    res.json({ ok: true, key });
  });

  // Auth: me
  app.get('/api/auth/me', async (req, res) => {
    const session = getSession(req);
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (session?.role === 'admin' || verifyAdminToken(bearer || '')) {
      return res.json({
        authenticated: true,
        user: {
          id: 'admin-primary',
          name: 'HelzerX Administrator',
          email: ADMIN_EMAIL,
          role: 'admin',
          provider: 'email',
          emailVerified: true,
        },
      });
    }

    if (session) {
      const users = await readJson<any[]>(USERS_FILE, []);
      const user = users.find((u) => u.id === session.userId);
      if (user && !user.banned) {
        return res.json({ authenticated: true, user: publicUser(user) });
      }
    }

    return res.status(401).json({ authenticated: false });
  });

  app.get('/api/auth/session', (req, res) => {
    const session = getSession(req);
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const isAdmin = session?.role === 'admin' || verifyAdminToken(bearer || '');
    res.json({ authenticated: Boolean(session || isAdmin), role: isAdmin ? 'admin' : session?.role || null });
  });

  // Authenticated client dashboard data. Secrets never leave this server.
  app.get('/api/client/dashboard', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((candidate) => candidate.id === session.userId && !candidate.banned);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    res.set('Cache-Control', 'no-store');

    if (!PTERODACTYL_URL || !PTERODACTYL_APPLICATION_TOKEN) {
      return res.json({
        configured: false,
        user: publicUser(user),
        servers: [],
        panelUrl: null,
      });
    }

    const headers = {
      Authorization: `Bearer ${PTERODACTYL_APPLICATION_TOKEN}`,
      Accept: 'Application/vnd.pterodactyl.v1+json',
      'Content-Type': 'application/json',
    };

    try {
      const allServers: any[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= 20) {
        const url = new URL('/api/application/servers', PTERODACTYL_URL);
        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', '100');
        url.searchParams.set('include', 'user,node,allocations');
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
          console.error(`[Pterodactyl] Dashboard request failed with status ${response.status}`);
          return res.status(502).json({ error: 'Hosting control plane is temporarily unavailable.' });
        }
        const payload = await response.json();
        allServers.push(...(Array.isArray(payload?.data) ? payload.data : []));
        totalPages = Number(payload?.meta?.pagination?.total_pages || 1);
        page += 1;
      }

      const email = String(user.email || '').trim().toLowerCase();
      const ownedServers = allServers
        .filter((entry) => {
          const attrs = entry?.attributes || {};
          const owner = entry?.relationships?.user?.attributes || {};
          return String(owner.email || '').trim().toLowerCase() === email || String(attrs.user || '') === String(user.pterodactylUserId || '');
        })
        .map((entry) => {
          const attrs = entry?.attributes || {};
          const allocations = entry?.relationships?.allocations?.data || [];
          const primary = allocations.find((allocation: any) => allocation?.attributes?.is_default) || allocations.find((allocation: any) => String(allocation?.attributes?.id) === String(attrs.allocation)) || allocations[0];
          const allocation = primary?.attributes || null;
          const node = entry?.relationships?.node?.attributes || null;
          return {
            id: Number(attrs.id),
            identifier: String(attrs.identifier || attrs.uuid || ''),
            name: String(attrs.name || 'Unnamed server'),
            suspended: Boolean(attrs.suspended),
            installed: attrs.container?.installed !== false,
            limits: {
              memoryMb: Number(attrs.limits?.memory || 0),
              diskMb: Number(attrs.limits?.disk || 0),
              cpu: Number(attrs.limits?.cpu || 0),
            },
            allocation: allocation ? {
              ip: String(allocation.ip || ''),
              alias: allocation.ip_alias ? String(allocation.ip_alias) : null,
              port: Number(allocation.port || 0),
            } : null,
            node: node ? String(node.name || node.fqdn || '') : null,
            createdAt: attrs.created_at || null,
            updatedAt: attrs.updated_at || null,
          };
        });

      return res.json({
        configured: true,
        user: publicUser(user),
        servers: ownedServers,
        panelUrl: PTERODACTYL_URL,
      });
    } catch (error) {
      console.error('[Pterodactyl] Dashboard integration error:', error instanceof Error ? error.message : 'unknown');
      return res.status(502).json({ error: 'Hosting control plane is temporarily unavailable.' });
    }
  });


  // Full client control plane. The Pterodactyl client token is encrypted at rest and never returned.
  app.post('/api/client/pterodactyl/connect', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') return res.status(401).json({ error: 'Authentication required.' });
    if (!PTERODACTYL_URL) return res.status(503).json({ error: 'Pterodactyl is not configured.' });

    const token = String(req.body?.token || '').trim();
    if (!/^ptlc_[A-Za-z0-9._-]+$/.test(token)) {
      return res.status(400).json({ error: 'Enter a valid Pterodactyl Client API key.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((candidate) => candidate.id === session.userId && !candidate.banned);
    if (!user) return res.status(401).json({ error: 'Session is no longer valid.' });

    try {
      const accountResult = await pterodactylClientRequest(token, '/api/client/account');
      if (!accountResult.response.ok) return res.status(401).json({ error: 'Pterodactyl rejected that API key.' });

      const remoteEmail = String(accountResult.payload?.attributes?.email || '').trim().toLowerCase();
      if (!remoteEmail || remoteEmail !== String(user.email || '').trim().toLowerCase()) {
        return res.status(403).json({ error: 'That Pterodactyl key does not belong to this account email.' });
      }

      await savePterodactylClientToken(user.id, token);
      await appendSecurityLog({
        actor: user.email,
        type: 'pterodactyl_client_key_connected',
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser',
        details: 'Customer connected a Pterodactyl Client API key.',
        severity: 'info',
      });
      res.json({ ok: true, connected: true });
    } catch {
      res.status(502).json({ error: 'Unable to validate the Pterodactyl connection.' });
    }
  });

  app.delete('/api/client/pterodactyl/connect', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') return res.status(401).json({ error: 'Authentication required.' });
    await removePterodactylClientToken(session.userId);
    res.json({ ok: true, connected: false });
  });

  app.get('/api/client/portal', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') return res.status(401).json({ error: 'Authentication required.' });

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((candidate) => candidate.id === session.userId && !candidate.banned);
    if (!user) return res.status(401).json({ error: 'Session is no longer valid.' });

    res.set('Cache-Control', 'no-store');
    if (!PTERODACTYL_URL) {
      return res.json({ connected: false, user: publicUser(user), panelUrl: null, servers: [] });
    }

    const token = await getPterodactylClientToken(user.id);

    // A connected Client API key unlocks the full Pterodactyl control plane.
    if (token) {
      try {
        const accountResult = await pterodactylClientRequest(token, '/api/client/account');
        if (!accountResult.response.ok) {
          await removePterodactylClientToken(user.id);
          return res.json({ connected: false, user: publicUser(user), panelUrl: PTERODACTYL_URL, servers: [] });
        }

        const remoteEmail = String(accountResult.payload?.attributes?.email || '').trim().toLowerCase();
        if (remoteEmail !== String(user.email || '').trim().toLowerCase()) {
          await removePterodactylClientToken(user.id);
          return res.status(403).json({ error: 'Pterodactyl account no longer matches this customer account.' });
        }

        const all: any[] = [];
        let page = 1;
        let totalPages = 1;
        while (page <= totalPages && page <= 20) {
          const result = await pterodactylClientRequest(token, `/api/client?type=owner&per_page=100&page=${page}`);
          if (!result.response.ok) throw new Error('server-list-failed');
          all.push(...(Array.isArray(result.payload?.data) ? result.payload.data : []));
          totalPages = Number(result.payload?.meta?.pagination?.total_pages || 1);
          page += 1;
        }

        return res.json({
          connected: true,
          user: publicUser(user),
          panelUrl: PTERODACTYL_URL,
          servers: all.map((entry) => pterodactylPublicServer(entry?.attributes || {})),
        });
      } catch {
        return res.status(502).json({ error: 'Hosting control plane is temporarily unavailable.' });
      }
    }

    // No Client API key yet: still show only the real services belonging to
    // the authenticated HelzerX account. Controls remain locked until a
    // matching Client API key is connected.
    if (!PTERODACTYL_APPLICATION_TOKEN) {
      return res.json({ connected: false, user: publicUser(user), panelUrl: PTERODACTYL_URL, servers: [] });
    }

    try {
      const headers = {
        Authorization: `Bearer ${PTERODACTYL_APPLICATION_TOKEN}`,
        Accept: 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
      };
      const email = String(user.email || '').trim().toLowerCase();
      const allServers: any[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= 20) {
        const url = new URL('/api/application/servers', PTERODACTYL_URL);
        url.searchParams.set('page', String(page));
        url.searchParams.set('per_page', '100');
        url.searchParams.set('include', 'user,node,allocations');
        const response = await fetch(url, { headers, signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('application-server-list-failed');
        const payload = await response.json();
        allServers.push(...(Array.isArray(payload?.data) ? payload.data : []));
        totalPages = Number(payload?.meta?.pagination?.total_pages || 1);
        page += 1;
      }

      const servers = allServers.filter((entry) => {
        const attrs = entry?.attributes || {};
        const owner = entry?.relationships?.user?.attributes || {};
        return String(owner.email || '').trim().toLowerCase() === email
          || String(attrs.user || '') === String(user.pterodactylUserId || '');
      }).map((entry) => {
        const attrs = entry?.attributes || {};
        const allocations = entry?.relationships?.allocations?.data || [];
        const primary = allocations.find((a: any) => a?.attributes?.is_default)
          || allocations.find((a: any) => String(a?.attributes?.id) === String(attrs.allocation))
          || allocations[0];
        const allocation = primary?.attributes || null;
        const node = entry?.relationships?.node?.attributes || null;
        return {
          identifier: String(attrs.identifier || attrs.uuid || ''),
          uuid: String(attrs.uuid || ''),
          name: String(attrs.name || 'Unnamed server'),
          description: String(attrs.description || ''),
          node: node ? String(node.name || node.fqdn || '') : '',
          status: attrs.suspended ? 'suspended' : (attrs.container?.installed === false ? 'installing' : 'offline'),
          suspended: Boolean(attrs.suspended),
          installing: attrs.container?.installed === false,
          transferring: false,
          limits: {
            memory: Number(attrs.limits?.memory || 0),
            disk: Number(attrs.limits?.disk || 0),
            cpu: Number(attrs.limits?.cpu || 0),
            swap: Number(attrs.limits?.swap || 0),
          },
          featureLimits: {
            databases: Number(attrs.feature_limits?.databases || 0),
            allocations: Number(attrs.feature_limits?.allocations || 0),
            backups: Number(attrs.feature_limits?.backups || 0),
          },
          permissions: [],
          allocation: allocation?.ip ? {
            ip: String(allocation.ip),
            alias: allocation.ip_alias ? String(allocation.ip_alias) : null,
            port: Number(allocation.port || 0),
          } : null,
          sftp: attrs.sftp_details ? {
            ip: String(attrs.sftp_details.ip || ''),
            port: Number(attrs.sftp_details.port || 0),
          } : null,
        };
      });

      return res.json({
        connected: false,
        user: publicUser(user),
        panelUrl: PTERODACTYL_URL,
        servers,
      });
    } catch {
      return res.status(502).json({ error: 'Hosting control plane is temporarily unavailable.' });
    }
  });

  app.get('/api/client/server/:identifier/resources', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/resources`);
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Unable to read live resources.' });
      res.set('Cache-Control', 'no-store');
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Unable to read live resources.' }); }
  });

  app.post('/api/client/server/:identifier/power', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const signal = String(req.body?.signal || '');
    if (!['start', 'stop', 'restart', 'kill'].includes(signal)) return res.status(400).json({ error: 'Invalid power action.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/power`, {
        method: 'POST',
        body: JSON.stringify({ signal }),
      });
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Power action was rejected by Pterodactyl.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'Power control is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/command', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const command = String(req.body?.command || '').trim();
    if (!command || command.length > 2000) return res.status(400).json({ error: 'Enter a valid command.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/command`, {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Command was rejected by Pterodactyl.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'Console command is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/websocket', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/websocket`);
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Unable to open console.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Console is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/activity', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/activity?per_page=100`);
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Unable to read activity.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Activity is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/files', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const directory = String(req.query.directory || '/');
    if (directory.length > 1024) return res.status(400).json({ error: 'Invalid directory.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/list?directory=${encodeURIComponent(directory)}`);
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Unable to list files.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'File manager is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/file', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const file = String(req.query.file || '');
    if (!file || file.length > 4096) return res.status(400).json({ error: 'Invalid file path.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/contents?file=${encodeURIComponent(file)}`);
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'Unable to read file.' });
      res.type('text/plain').send(typeof result.payload === 'string' ? result.payload : JSON.stringify(result.payload, null, 2));
    } catch { res.status(502).json({ error: 'File read is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/file/write', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const file = String(req.body?.file || '');
    const content = String(req.body?.content ?? '');
    if (!file || file.length > 4096 || content.length > 2_000_000) return res.status(400).json({ error: 'Invalid file write request.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/write?file=${encodeURIComponent(file)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: content,
      });
      if (!result.response.ok) return res.status(result.response.status === 404 ? 404 : 502).json({ error: 'File write was rejected.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'File write is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/file/folder', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const root = String(req.body?.root || '/');
    const name = String(req.body?.name || '').trim();
    if (root.length > 4096 || !name || name.length > 255) return res.status(400).json({ error: 'Invalid folder request.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/create-folder`, { method: 'POST', body: JSON.stringify({ root, name }) });
      if (!result.response.ok) return res.status(502).json({ error: 'Folder creation was rejected.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'Folder creation is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/file/delete', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const root = String(req.body?.root || '/');
    const files = Array.isArray(req.body?.files) ? req.body.files.map(String).filter(Boolean).slice(0, 100) : [];
    if (root.length > 4096 || !files.length) return res.status(400).json({ error: 'Invalid delete request.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/delete`, { method: 'POST', body: JSON.stringify({ root, files }) });
      if (!result.response.ok) return res.status(502).json({ error: 'File deletion was rejected.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'File deletion is temporarily unavailable.' }); }
  });

  app.put('/api/client/server/:identifier/file/rename', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const root = String(req.body?.root || '/');
    const files = Array.isArray(req.body?.files) ? req.body.files.slice(0, 50) : [];
    if (root.length > 4096 || !files.length) return res.status(400).json({ error: 'Invalid rename request.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/rename`, { method: 'PUT', body: JSON.stringify({ root, files }) });
      if (!result.response.ok) return res.status(502).json({ error: 'Rename was rejected.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'Rename is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/backups', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/backups?per_page=100`);
      if (!result.response.ok) return res.status(502).json({ error: 'Unable to list backups.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Backup service is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/backups', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const body = {
      name: String(req.body?.name || '').trim().slice(0, 255) || undefined,
      ignored: String(req.body?.ignored || '').slice(0, 10000) || undefined,
      is_locked: Boolean(req.body?.is_locked),
    };
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/backups`, { method: 'POST', body: JSON.stringify(body) });
      if (!result.response.ok) return res.status(502).json({ error: 'Backup creation was rejected.' });
      res.status(result.response.status).json(result.payload);
    } catch { res.status(502).json({ error: 'Backup creation is temporarily unavailable.' }); }
  });

  app.post('/api/client/server/:identifier/backups/:backup/restore', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/backups/${encodeURIComponent(req.params.backup)}/restore`, { method: 'POST', body: JSON.stringify({ truncate: req.body?.truncate !== false }) });
      if (!result.response.ok) return res.status(502).json({ error: 'Backup restore was rejected.' });
      res.status(result.response.status).json(result.payload || { ok: true });
    } catch { res.status(502).json({ error: 'Backup restore is temporarily unavailable.' }); }
  });

  app.delete('/api/client/server/:identifier/backups/:backup', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/backups/${encodeURIComponent(req.params.backup)}`, { method: 'DELETE' });
      if (!result.response.ok) return res.status(502).json({ error: 'Backup deletion was rejected.' });
      res.status(204).end();
    } catch { res.status(502).json({ error: 'Backup deletion is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/databases', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/databases`);
      if (!result.response.ok) return res.status(502).json({ error: 'Unable to list databases.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Database service is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/startup', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/startup`);
      if (!result.response.ok) return res.status(502).json({ error: 'Unable to load startup configuration.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Startup configuration is temporarily unavailable.' }); }
  });

  app.get('/api/client/server/:identifier/download', async (req, res) => {
    const auth = await requireClientPortalSession(req, res);
    if (!auth) return;
    const file = String(req.query.file || '');
    if (!file || file.length > 4096) return res.status(400).json({ error: 'Invalid file path.' });
    try {
      const result = await pterodactylClientRequest(auth.token, `/api/client/servers/${encodeURIComponent(req.params.identifier)}/files/download?file=${encodeURIComponent(file)}`);
      if (!result.response.ok) return res.status(502).json({ error: 'Unable to create a download link.' });
      res.json(result.payload);
    } catch { res.status(502).json({ error: 'Download service is temporarily unavailable.' }); }
  });

  // Admin login
  app.post('/api/admin/login', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!safeEqual(email, ADMIN_EMAIL) || !safeEqual(password, ADMIN_PASSWORD)) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const challengeId = crypto.randomBytes(24).toString('base64url');
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    otpChallenges.set(challengeId, {
      type: 'admin',
      code,
      codeHash,
      email: ADMIN_EMAIL,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const sent = await sendMail(ADMIN_EMAIL, 'HelzerX administrator verification code', `Your HelzerX verification code is: ${code}`);
    if (!sent) {
      otpChallenges.delete(challengeId);
      return res.status(502).json({ error: 'Unable to send the verification code. Check the email service configuration.' });
    }

    res.json({
      ok: true,
      requiresTwoFactor: true,
      challengeId,
      expiresAt: Date.now() + OTP_TTL_MS,
      message: RESEND_API_KEY
        ? 'A 6-digit verification code was sent to the administrator email.'
        : `Admin verification code generated: ${code}`,
      devCode: RESEND_API_KEY ? undefined : code,
    });
  });

  // Admin verify OTP
  app.post('/api/admin/verify-otp', async (req, res) => {
    const challengeId = String(req.body?.challengeId || '');
    const code = String(req.body?.code || '').replace(/\D/g, '');
    const challenge = otpChallenges.get(challengeId);

    if (!challenge || challenge.type !== 'admin' || challenge.expiresAt <= Date.now()) {
      return res.status(401).json({ error: 'Verification code expired. Please log in again.' });
    }

    challenge.attempts += 1;
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    if (challenge.attempts > 5 || !safeEqual(codeHash, challenge.codeHash)) {
      if (challenge.attempts > 5) otpChallenges.delete(challengeId);
      return res.status(401).json({ error: 'Invalid administrator verification code.' });
    }

    otpChallenges.delete(challengeId);

    const expiresAt = Date.now() + TOKEN_TTL_MS;
    const token = signAdminToken({ role: 'admin', email: ADMIN_EMAIL, exp: expiresAt });
    const adminUser = {
      id: 'admin-primary',
      name: 'HelzerX Administrator',
      email: ADMIN_EMAIL,
      role: 'admin' as const,
      provider: 'email',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const sessionId = createSession(adminUser);
    setSessionCookie(res, sessionId);

    res.json({ ok: true, token, expiresAt, user: adminUser });
  });

  // Customer register (Oracle Cloud Enterprise Standard)
  app.post('/api/auth/register', async (req, res) => {
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const rawName = String(req.body?.name || '').trim().replace(/\s+/g, ' ');
    const name = rawName || [firstName, lastName].filter(Boolean).join(' ') || 'Customer';
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const accountType = req.body?.accountType === 'corporate' ? 'corporate' : 'individual';
    const company = String(req.body?.company || '').trim();
    const country = String(req.body?.country || 'Sri Lanka').trim();
    const address = String(req.body?.address || '').trim();
    const city = String(req.body?.city || '').trim();
    const state = String(req.body?.state || '').trim();
    const postalCode = String(req.body?.postalCode || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (name.length < 2) {
      return res.status(400).json({ error: 'Please enter your first and last name.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    if (users.some((u) => u.email === email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const challengeId = crypto.randomBytes(24).toString('base64url');
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const digest = await passwordHash(password);

    const pendingUser = {
      id: `usr-${crypto.randomUUID()}`,
      name,
      firstName: firstName || name.split(' ')[0] || '',
      lastName: lastName || name.split(' ').slice(1).join(' ') || '',
      email,
      passwordDigest: digest,
      role: 'customer',
      provider: 'email',
      accountType,
      company,
      country,
      address,
      city,
      state,
      postalCode,
      phone,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    otpChallenges.set(challengeId, {
      type: 'register',
      code,
      codeHash,
      email,
      user: pendingUser,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const emailContent = buildSecurityEmail(code, 'Verify your HelzerX Cloud account', 'Use the code below to complete your account registration.', 'Email verification code');
    const sent = await sendMail(email, 'HelzerX Cloud email verification', emailContent.text, emailContent.html);
    if (!sent) {
      otpChallenges.delete(challengeId);
      return res.status(502).json({ error: 'Unable to send the verification code. Please try again later.' });
    }
    await appendSecurityLog({
      actor: email,
      type: 'register_otp_dispatched',
      ip: req.ip || '127.0.0.1',
      details: 'Registration verification code dispatched',
      severity: 'info',
    });

    res.status(201).json({
      ok: true,
      verificationRequired: true,
      challengeId,
      expiresAt: Date.now() + OTP_TTL_MS,
      message: RESEND_API_KEY
        ? 'A 6-digit verification code was sent to your email.'
        : `Verification code generated: ${code}`,
      devCode: RESEND_API_KEY ? undefined : code,
    });
  });

  // Verify email OTP
  app.post('/api/auth/verify-email-otp', async (req, res) => {
    const challengeId = String(req.body?.challengeId || '');
    const code = String(req.body?.code || '').replace(/\D/g, '');
    const challenge = otpChallenges.get(challengeId);

    if (!challenge || challenge.type !== 'register' || challenge.expiresAt <= Date.now()) {
      return res.status(401).json({ error: 'Verification code expired. Start registration again.' });
    }

    challenge.attempts += 1;
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    if (challenge.attempts > 5 || !safeEqual(codeHash, challenge.codeHash)) {
      return res.status(401).json({ error: 'Invalid verification code.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    users.push(challenge.user);
    await atomicWrite(USERS_FILE, users);
    otpChallenges.delete(challengeId);

    await appendSecurityLog({
      actor: challenge.user.email,
      type: 'account_registered_and_verified',
      ip: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: 'Customer email OTP confirmed and account saved to database',
      severity: 'info',
    });

    const sessionId = createSession(challenge.user);
    setSessionCookie(res, sessionId);

    res.json({ ok: true, user: publicUser(challenge.user) });
  });

  // Customer login
  app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((u) => u.email === email && u.provider === 'email');

    if (!user || !(await verifyPassword(password, user.passwordDigest))) {
      await appendSecurityLog({
        actor: email || 'unknown',
        type: 'login_failed',
        ip: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Browser',
        details: 'Invalid credentials attempted',
        severity: 'warning',
      });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.banned) {
      await appendSecurityLog({
        actor: email,
        type: 'login_blocked_banned',
        ip: req.ip || '127.0.0.1',
        details: 'Access rejected: Account is suspended',
        severity: 'critical',
      });
      return res.status(403).json({ error: 'This account has been disabled.' });
    }

    const challengeId = crypto.randomBytes(24).toString('base64url');
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    otpChallenges.set(challengeId, {
      type: 'login',
      code,
      codeHash,
      email,
      user,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const emailContent = buildSecurityEmail(code, 'Sign in to HelzerX Cloud', 'A sign-in attempt was made for your account. Enter the code below to continue.', 'Sign-in code');
    const sent = await sendMail(email, 'HelzerX Cloud sign-in code', emailContent.text, emailContent.html);
    if (!sent) {
      otpChallenges.delete(challengeId);
      return res.status(502).json({ error: 'Unable to send the sign-in code. Please try again later.' });
    }

    res.json({
      ok: true,
      requiresTwoFactor: true,
      challengeId,
      expiresAt: Date.now() + OTP_TTL_MS,
      message: RESEND_API_KEY
        ? 'A 6-digit sign-in code was sent to your email.'
        : `Sign-in code generated: ${code}`,
      devCode: RESEND_API_KEY ? undefined : code,
    });
  });

  // Verify login OTP
  app.post('/api/auth/verify-login-otp', async (req, res) => {
    const challengeId = String(req.body?.challengeId || '');
    const code = String(req.body?.code || '').replace(/\D/g, '');
    const challenge = otpChallenges.get(challengeId);

    if (!challenge || challenge.type !== 'login' || challenge.expiresAt <= Date.now()) {
      return res.status(401).json({ error: 'Sign-in code expired. Start sign-in again.' });
    }

    challenge.attempts += 1;
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    if (challenge.attempts > 5 || !safeEqual(codeHash, challenge.codeHash)) {
      return res.status(401).json({ error: 'Invalid sign-in code.' });
    }

    otpChallenges.delete(challengeId);

    const sessionId = createSession(challenge.user);
    setSessionCookie(res, sessionId);

    res.json({ ok: true, user: publicUser(challenge.user) });
  });

  // Forgot password
  app.post('/api/auth/forgot-password', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((u) => u.email === email && u.provider === 'email');

    if (!user) {
      return res.json({ ok: true, message: 'If an account exists, a reset code was sent.' });
    }

    const challengeId = crypto.randomBytes(24).toString('base64url');
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    otpChallenges.set(challengeId, {
      type: 'reset',
      code,
      codeHash,
      email,
      userId: user.id,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    const emailContent = buildSecurityEmail(code, 'Reset your HelzerX Cloud password', 'Use the code below to securely reset your password.', 'Password reset code');
    const sent = await sendMail(email, 'HelzerX password reset code', emailContent.text, emailContent.html);
    if (!sent) return res.status(502).json({ error: 'Unable to send the password reset code. Please try again later.' });

    res.json({
      ok: true,
      challengeId,
      expiresAt: Date.now() + OTP_TTL_MS,
      message: RESEND_API_KEY
        ? 'A 6-digit password reset code was sent to your email.'
        : `Reset code generated: ${code}`,
      devCode: RESEND_API_KEY ? undefined : code,
    });
  });

  // Reset password
  app.post('/api/auth/reset-password', async (req, res) => {
    const challengeId = String(req.body?.challengeId || '');
    const code = String(req.body?.code || '').replace(/\D/g, '');
    const password = String(req.body?.password || '');
    const challenge = otpChallenges.get(challengeId);

    if (!challenge || challenge.type !== 'reset' || challenge.expiresAt <= Date.now()) {
      return res.status(401).json({ error: 'Reset code expired. Start password reset again.' });
    }

    if (password.length < 10) {
      return res.status(400).json({ error: 'Password must be at least 10 characters.' });
    }

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    if (!safeEqual(codeHash, challenge.codeHash)) {
      return res.status(401).json({ error: 'Invalid reset code.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((u) => u.id === challenge.userId);
    if (user) {
      user.passwordDigest = await passwordHash(password);
      await atomicWrite(USERS_FILE, users);
    }

    otpChallenges.delete(challengeId);
    res.json({ ok: true, message: 'Password reset successfully.' });
  });

  // Resend OTP Code
  app.post('/api/auth/resend-otp', async (req, res) => {
    const challengeId = String(req.body?.challengeId || '');
    const challenge = otpChallenges.get(challengeId);

    if (!challenge) {
      return res.status(404).json({ error: 'Authentication challenge expired. Please initiate again.' });
    }

    const newCode = String(crypto.randomInt(100000, 1000000));
    challenge.code = newCode;
    challenge.codeHash = crypto.createHash('sha256').update(newCode).digest('hex');
    challenge.expiresAt = Date.now() + OTP_TTL_MS;
    challenge.attempts = 0;

    const emailContent = buildSecurityEmail(newCode, 'Your new HelzerX Cloud verification code', 'Here is your newly requested code. Your previous code is no longer valid.', 'New verification code');
    const sent = await sendMail(challenge.email, 'HelzerX Cloud verification code (Resent)', emailContent.text, emailContent.html);
    if (!sent) {
      return res.status(502).json({ error: 'Unable to resend the verification code. Please try again later.' });
    }
    await appendSecurityLog({
      actor: challenge.email,
      type: 'otp_resend',
      ip: req.ip || '127.0.0.1',
      details: `New OTP dispatched for ${challenge.type}`,
    });

    res.json({
      ok: true,
      challengeId,
      expiresAt: challenge.expiresAt,
      message: RESEND_API_KEY
        ? 'A new verification code was sent to your email.'
        : `New verification code generated: ${newCode}`,
      devCode: RESEND_API_KEY ? undefined : newCode,
    });
  });

  // Social authentication is fail-closed until a provider-side OAuth/OIDC
  // implementation verifies the identity with the provider. Client-supplied
  // email/name fields are never accepted as proof of identity.
  app.post('/api/auth/social-login', (_req, res) => {
    res.status(501).json({
      error: 'Social authentication is not configured. Please use email authentication.',
    });
  });

  // Admin Security Logs
  app.get('/api/admin/security-logs', async (req, res) => {
    const session = getSession(req);
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const isAdmin = session?.role === 'admin' || verifyAdminToken(bearer || '');

    if (!isAdmin) {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    const logs = await readJson<any[]>(SECURITY_LOGS_FILE, []);
    res.json({ ok: true, logs });
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req);
    const id = cookies.arvex_secure_session || cookies.arvex_session;
    if (id) inMemorySessions.delete(id);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.post('/api/admin/logout', (req, res) => {
    const cookies = parseCookies(req);
    const id = cookies.arvex_secure_session || cookies.arvex_session;
    if (id) inMemorySessions.delete(id);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  // Payments / PayHere
  app.get('/api/payments/payhere/quote', async (req, res) => {
    const planId = String(req.query.planId || '');
    const cycle = String(req.query.cycle || 'monthly');
    const config = await readJson<Record<string, unknown>>(CMS_FILE, {});
    const plans = (config.plans as any[]) || INITIAL_PLANS;
    const plan = plans.find((p) => String(p.id) === planId);

    if (!plan) return res.status(404).json({ error: 'Plan not found.' });

    let usd = Number(plan.monthlyPrice);
    if (cycle === 'quarterly' && Number(plan.quarterlyPrice)) usd = Number(plan.quarterlyPrice);
    if (cycle === 'yearly' && Number(plan.yearlyPrice)) usd = Number(plan.yearlyPrice);

    const lkr = Math.round(usd * USD_TO_LKR * 100) / 100;
    res.json({ ok: true, planId: plan.id, planName: plan.name, cycle, amountUsd: usd, amountLkr: lkr, currency: 'LKR' });
  });

  app.post('/api/payments/payhere/create', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') {
      return res.status(401).json({ error: 'Sign in before starting payment.' });
    }

    const users = await readJson<any[]>(USERS_FILE, []);
    const user = users.find((candidate) => candidate.id === session.userId && !candidate.banned);
    if (!user) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }

    const planId = String(req.body?.planId || '').trim();
    const cycle = String(req.body?.cycle || 'monthly');
    const couponCode = String(req.body?.couponCode || '').trim().toUpperCase();
    const phone = String(req.body?.phone || user.phone || '').trim();
    const address = String(req.body?.address || user.address || '').trim();
    const city = String(req.body?.city || user.city || '').trim();
    const configuration = req.body?.configuration && typeof req.body.configuration === 'object'
      ? {
          location: String(req.body.configuration.location || '').trim().slice(0, 120),
          hostname: String(req.body.configuration.hostname || '').trim().slice(0, 80),
          osOrVersion: String(req.body.configuration.osOrVersion || '').trim().slice(0, 120),
          dedicatedIp: Boolean(req.body.configuration.dedicatedIp),
          dailyBackups: Boolean(req.body.configuration.dailyBackups),
          customNotes: String(req.body.configuration.customNotes || '').trim().slice(0, 500),
        }
      : null;

    if (!['monthly', 'quarterly', 'yearly'].includes(cycle)) {
      return res.status(400).json({ error: 'Invalid billing cycle.' });
    }
    if (!configuration?.hostname || !configuration.location || !configuration.osOrVersion) {
      return res.status(400).json({ error: 'Complete the service configuration before payment.' });
    }
    if (!phone || !address || !city) {
      return res.status(400).json({ error: 'Phone, address and city are required for PayHere.' });
    }

    const config = await readJson<Record<string, unknown>>(CMS_FILE, {});
    const plans = (config.plans as any[]) || INITIAL_PLANS;
    const plan = plans.find((item) => String(item.id) === planId && item.status !== 'inactive');
    if (!plan) return res.status(404).json({ error: 'Plan not found or unavailable.' });

    let usd = Number(plan.monthlyPrice || 0);
    if (cycle === 'quarterly') usd = Number(plan.quarterlyPrice || usd * 3 * 0.9);
    if (cycle === 'yearly') usd = Number(plan.yearlyPrice || usd * 12 * 0.8);

    let discountUsd = 0;
    if (couponCode) {
      const coupons = (config.coupons as any[]) || INITIAL_COUPONS;
      const coupon = coupons.find((item) =>
        String(item.code || '').toUpperCase() === couponCode &&
        item.active !== false &&
        (!item.expiresAt || new Date(item.expiresAt).getTime() > Date.now())
      );
      if (!coupon) return res.status(400).json({ error: 'Invalid or expired coupon code.' });
      discountUsd = usd * (Number(coupon.discountPercentage || 0) / 100);
    }

    const finalUsd = Math.max(0, usd - discountUsd);
    const lkr = Math.round(finalUsd * USD_TO_LKR * 100) / 100;
    if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET || !lkr) {
      return res.status(503).json({ error: 'PayHere is not currently configured for live payments.' });
    }

    const orderId = `ARX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    const orders = await readJson<any[]>(ORDERS_FILE, []);
    orders.unshift({
      orderId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId: plan.id,
      planName: String(plan.name || plan.id),
      cycle,
      configuration,
      amountUsd: finalUsd,
      amountLkr: lkr,
      currency: 'LKR',
      couponCode: couponCode || null,
      discountUsd,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await atomicWrite(ORDERS_FILE, orders);

    const md5Secret = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
    const amount = lkr.toFixed(2);
    const hash = crypto.createHash('md5')
      .update(PAYHERE_MERCHANT_ID + orderId + amount + 'LKR' + md5Secret)
      .digest('hex')
      .toUpperCase();

    const origin = PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`;
    const firstName = String(user.firstName || user.name || 'HelzerX').trim().split(/\s+/)[0] || 'HelzerX';
    const lastName = String(user.lastName || user.name || 'Customer').trim().split(/\s+/).slice(1).join(' ') || 'Customer';

    res.json({
      ok: true,
      action: PAYHERE_SANDBOX ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout',
      orderId,
      amountUsd: finalUsd,
      amountLkr: lkr,
      currency: 'LKR',
      fields: {
        merchant_id: PAYHERE_MERCHANT_ID,
        return_url: `${origin}/#/payment?orderId=${encodeURIComponent(orderId)}&status=return`,
        cancel_url: `${origin}/#/payment?orderId=${encodeURIComponent(orderId)}&status=cancelled`,
        notify_url: `${origin}/api/payments/payhere/notify`,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone,
        address,
        city,
        country: String(user.country || 'Sri Lanka'),
        order_id: orderId,
        items: `${String(plan.name || plan.id)} - ${cycle}`,
        currency: 'LKR',
        amount,
        hash,
        custom_1: String(plan.id),
        custom_2: String(user.id),
      },
    });
  });

  app.get('/api/payments/payhere/status', async (req, res) => {
    const session = getSession(req);
    if (!session || session.role !== 'customer') return res.status(401).json({ error: 'Authentication required.' });

    const orderId = String(req.query.orderId || '');
    const orders = await readJson<any[]>(ORDERS_FILE, []);
    const order = orders.find((item) => item.orderId === orderId && item.userId === session.userId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    res.set('Cache-Control', 'no-store');
    res.json({
      status: order.status === 'paid' ? 'paid' : order.status === 'failed' ? 'failed' : 'pending',
      statusMessage: order.status,
      orderId: order.orderId,
      amountLkr: order.amountLkr,
      amountUsd: order.amountUsd,
      currency: order.currency,
      planId: order.planId,
      planName: order.planName,
      transactionId: order.transactionId || null,
    });
  });

  app.post('/api/payments/payhere/notify', async (req, res) => {
    const body = req.body || {};
    const merchantId = String(body.merchant_id || '');
    const orderId = String(body.order_id || '');
    const payhereAmount = String(body.payhere_amount || '');
    const payhereCurrency = String(body.payhere_currency || '');
    const statusCode = String(body.status_code || '');
    const md5sig = String(body.md5sig || '').toUpperCase();
    const paymentId = String(body.payment_id || `pay-${Date.now()}`);

    if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET || merchantId !== PAYHERE_MERCHANT_ID) {
      return res.status(400).send('INVALID');
    }

    const orders = await readJson<any[]>(ORDERS_FILE, []);
    const order = orders.find((item) => item.orderId === orderId);
    if (!order) return res.status(404).send('NOT_FOUND');

    const secretHash = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
    const expected = crypto.createHash('md5')
      .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash)
      .digest('hex')
      .toUpperCase();

    if (!md5sig || !safeEqual(expected, md5sig)) {
      console.error(`[PayHere] Rejected invalid signature for order ${orderId}`);
      return res.status(400).send('INVALID_SIGNATURE');
    }

    if (payhereCurrency !== String(order.currency || 'LKR')) return res.status(400).send('INVALID_CURRENCY');
    if (Number(payhereAmount).toFixed(2) !== Number(order.amountLkr).toFixed(2)) return res.status(400).send('INVALID_AMOUNT');

    order.transactionId = paymentId;
    order.payhereMethod = String(body.method || '');
    order.payhereStatusMessage = String(body.status_message || '');
    order.updatedAt = new Date().toISOString();

    if (statusCode === '2') {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();
    } else if (['-1', '-2', '-3'].includes(statusCode)) {
      order.status = 'failed';
    } else {
      order.status = 'pending';
    }

    await atomicWrite(ORDERS_FILE, orders);
    res.send('OK');
  });

  // Clean-up expired OTPs every 10 min
  setInterval(() => {
    const now = Date.now();
    for (const [id, challenge] of otpChallenges.entries()) {
      if (challenge.expiresAt <= now) otpChallenges.delete(id);
    }
    for (const [id, session] of inMemorySessions.entries()) {
      if (session.expiresAt <= now) inMemorySessions.delete(id);
    }
  }, 10 * 60 * 1000).unref();

  // Mount Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HelzerX Cloud full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
