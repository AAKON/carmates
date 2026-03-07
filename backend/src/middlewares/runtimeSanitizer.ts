import type { NextFunction, Request, Response } from 'express';

// Basic NoSQL / prototype pollution guard for plain JS objects
export function stripDangerousKeys(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  const cleanse = (obj: unknown): void => {
    if (!obj || typeof obj !== 'object') return;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const target = obj as { [key: string]: any };
    for (const key of Object.keys(target)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        delete target[key];
        // eslint-disable-next-line no-continue
        continue;
      }
      if (key.startsWith('$')) {
        delete target[key];
        // eslint-disable-next-line no-continue
        continue;
      }
      cleanse(target[key]);
    }
  };

  cleanse(_req.body);
  cleanse(_req.query);
  cleanse(_req.params);

  next();
}

