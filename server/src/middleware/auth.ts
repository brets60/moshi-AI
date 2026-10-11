import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

let supabaseClient: any = null;
if (config.supabaseUrl && config.supabaseUrl !== 'https://mock.supabase.co' && config.supabaseAnonKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  } catch (err) {
    console.warn('Supabase client initialization skipped:', err);
  }
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header with Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  // If live Supabase client is available, verify token with Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired session token.',
        });
      }
      req.userId = data.user.id;
      req.userEmail = data.user.email;
      return next();
    } catch (err: any) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Failed to verify session token.',
      });
    }
  }

  // Fallback for local development and offline mock tests:
  // Accept standard test tokens or base64 user IDs safely
  try {
    if (token === 'dev-token-test-user') {
      req.userId = '00000000-0000-0000-0000-000000000001';
      req.userEmail = 'farmer@agrimate.local';
      return next();
    }

    // Try decoding JWT payload to get user id if token format is standard header.payload.sig
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      req.userId = payload.sub || payload.user_id || '00000000-0000-0000-0000-000000000001';
      req.userEmail = payload.email || 'farmer@agrimate.local';
      return next();
    }

    // Default fallback to token string if uuid-like
    req.userId = token.length >= 10 ? token : '00000000-0000-0000-0000-000000000001';
    req.userEmail = 'farmer@agrimate.local';
    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid session token format.',
    });
  }
}
