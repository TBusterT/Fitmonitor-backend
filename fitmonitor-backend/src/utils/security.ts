import crypto from 'crypto';
import { HttpError } from './http';

const base64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET має бути заданий у .env і містити мінімум 16 символів');
  }
  return secret;
};

const parseExpiresIn = (value = process.env.JWT_EXPIRES_IN ?? '1d') => {
  const match = /^([0-9]+)([smhd])$/.exec(value);
  if (!match) return 24 * 60 * 60;

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multiplier[unit];
};

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
};

export type JwtPayload = {
  sub: number;
  email: string;
  name: string;
  iat: number;
  exp: number;
};

export const signJwt = (payload: Omit<JwtPayload, 'iat' | 'exp'>) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + parseExpiresIn()
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};

export const verifyJwt = (token: string): JwtPayload => {
  const [headerPart, payloadPart, signature] = token.split('.');
  if (!headerPart || !payloadPart || !signature) {
    throw new HttpError(401, 'Некоректний JWT-токен');
  }

  const unsigned = `${headerPart}.${payloadPart}`;
  const expected = crypto.createHmac('sha256', getSecret()).update(unsigned).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new HttpError(401, 'Недійсний JWT-токен');
  }

  const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, 'Термін дії JWT-токена завершився');
  }

  return payload;
};
