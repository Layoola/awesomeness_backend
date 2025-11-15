import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}
